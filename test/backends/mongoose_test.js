var should = require('should'),
	StreamMongoose = require('../../src/backends/mongoose.js'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	stream = require('../../src/index.js'),
	Promise = require('promise'),
	sinon = require('sinon'),
	mockery = require('mockery');

require('../utils/promise');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/test', { useMongoClient: true });

var userSchema = new Schema({
	name: String,
});

var linkSchema = new Schema({
	href: String,
});

var tweetSchema = new Schema({
	text: String,
	actor: { type: Schema.Types.ObjectId, ref: 'User' },
	bg: String,
	link: { type: Schema.Types.ObjectId, ref: 'Link' }
});

tweetSchema.plugin(StreamMongoose.activity);

tweetSchema.statics.pathsToPopulate = function() {
	return ['actor', 'link'];
};

tweetSchema.methods.activityNotify = function() {
	return [
		stream.FeedManager.getFeed('notification', '1'),
		stream.FeedManager.getFeed('notification', '2')
	];
};

tweetSchema.methods.activityExtraData = function() {
	return { bg: this.bg, link: this.link };
};

tweetSchema.methods.activityActorProp = function() {
	return 'actor';
};

StreamMongoose.setupMongoose(mongoose);

var Tweet = mongoose.model('Tweet', tweetSchema);
var User = mongoose.model('User', userSchema);
var Link = mongoose.model('Link', linkSchema);
var backend = new StreamMongoose.Backend();

describe('Backend', function() {
	var requestStub;

	before(function(done) {
		var actor = new User({ name: 'actor1' });
		var link;

		var save = Promise.denodeify(actor.save);

		save
			.call(actor)
			.then(
				function() {
					this.actor = actor;
					link = new Link({ href: 'https://getstream.io' });
					var linkSave = Promise.denodeify(link.save);
					return linkSave.call(link);
				}.bind(this),
				done
			)
			.then(
				function() {
					this.link = link;
					done();
				}.bind(this),
				done
			);

		// replace the module `request` with a stub object
		mockery.enable({});
		requestStub = sinon.stub();
		mockery.registerMock('request', requestStub);
	});

	after(function() {
		mockery.disable();
	});

	it('serialise null', function(done) {
		var activity = { object: null };
		backend.serializeActivities([activity]);
		backend
			.enrichActivities([activity])
			.then(function(enriched) {
				enriched.should.length(1);
				enriched[0].should.have.property('object', null);
				done();
			})
			.catch(done);
	});

	it('dont enrich origin field', function(done) {
		var activity = { origin: 'user:42' };
		backend
			.enrichActivities([activity])
			.then(function(enriched) {
				enriched.should.length(1);
				enriched[0].should.have.property('origin', 'user:42');
				done();
			})
			.catch(done);
	});

	it('enrich aggregated activity complex mix', function(done) {
		var self = this;
		var tweet1 = new Tweet();
		var tweet2 = new Tweet();
		tweet1.text = 'tweet1';
		tweet1.actor = this.actor;
		tweet2.text = 'tweet2';
		tweet2.actor = this.actor;
		var tweets = [tweet1, tweet2];
		Tweet.create(tweets, function(err) {
			should.not.exist(err);
			var activities = [tweet1.createActivity()];
			var activities2 = [tweet2.createActivity()];
			backend.serializeActivities(activities);
			backend.serializeActivities(activities2);
			var aggregatedActivities = [
				{ actor_count: 1, activities: activities },
				{ actor_count: 1, activities: activities2 }
			];
			backend
				.enrichAggregatedActivities(aggregatedActivities)
				.then(function(enriched) {
					enriched.should.length(2);
					var firstAggregation = enriched[0];
					var secondAggregation = enriched[1];
					firstAggregation.should.have
						.property('activities')
						.with.lengthOf(1);
					firstAggregation['activities'][0].should.have.property('actor');
					firstAggregation['activities'][0].should.have.property('object');
					firstAggregation['activities'][0].object.should.have.property('_id');
					firstAggregation['activities'][0].should.have.property('verb');
					secondAggregation['activities'][0].should.have.property('actor');
					secondAggregation['activities'][0].should.have.property('object');
					secondAggregation['activities'][0].object.should.have.property('_id');
					secondAggregation['activities'][0].should.have.property('verb');
					firstAggregation['activities'][0].object._id.should.not.equal(secondAggregation['activities'][0].object._id);
					done();
				})
				.catch(done);
		});
	});

	it('enrich aggregated activity', function(done) {
		var self = this;
		var tweet = new Tweet();
		tweet.text = 'test';
		tweet.actor = this.actor;
		tweet.save(function(err) {
			should.not.exist(err);
			var activity = tweet.createActivity();
			backend.serializeActivities([activity]);
			var aggregatedActivities = [
				{ actor_count: 1, activities: [activity] }
			];
			backend
				.enrichAggregatedActivities(aggregatedActivities)
				.then(function(enriched) {
					enriched.should.length(1);
					enriched[0].should.have
						.property('activities')
						.with.lengthOf(1);
					enriched[0]['activities'][0].should.have.property('actor');
					enriched[0]['activities'][0].should.have.property('object');
					enriched[0]['activities'][0].should.have.property('verb');
					done();
				})
				.catch(done);
		});
	});

	it('enrich aggregated activity with 2 groups', function(done) {
		var self = this;
		var tweet = new Tweet();
		tweet.text = 'test';
		tweet.actor = this.actor;
		tweet.save(function(err) {
			should.not.exist(err);
			var activity = tweet.createActivity();
			backend.serializeActivities([activity]);
			var aggregatedActivities = [
				{ actor_count: 1, activities: [activity] },
				{ actor_count: 1, activities: [activity, activity] }
			];
			backend
				.enrichAggregatedActivities(aggregatedActivities)
				.then(function(enriched) {
					enriched.should.length(2);
					enriched[0].should.have
						.property('activities')
						.with.lengthOf(1);
					enriched[0]['activities'][0].should.have.property('actor');
					enriched[0]['activities'][0].should.have.property('object');
					enriched[0]['activities'][0].should.have.property('verb');

					enriched[1].should.have
						.property('activities')
						.with.lengthOf(2);
					enriched[1]['activities'][0].should.have.property('actor');
					enriched[1]['activities'][0].should.have.property('object');
					enriched[1]['activities'][0].should.have.property('verb');
					done();
				})
				.catch(done);
		});
	});

	it('delete activity', function(done) {
		var tweet = new Tweet();
		tweet.text = 'test';
		tweet.actor = this.actor;
		tweet.save(function(err) {
			if (err) return done(err);
			tweet.remove(done);
		});
	});

	it('enrich one activity', function() {
		var self = this;
		var tweet = new Tweet();
		tweet.text = 'test';
		tweet.actor = this.actor;

		return tweet.save
			.promisify(tweet)
			.then(function() {
				return tweet.populate.promisify(tweet, 'actor');
			})
			.then(function(tweet) {
				var activity = tweet.createActivity();

				backend.serializeActivities([activity]);
				activity = JSON.parse(JSON.stringify(activity));

				return backend.enrichActivities([activity]);
			})
			.then(function(enriched) {
				enriched.should.length(1);
				enriched[0].should.have.property('actor');
				enriched[0]['actor'].should.have.property('_id', self.actor._id);
				enriched[0].should.have.property('foreign_id', 'Tweet:' + tweet._id);
			});
	});

	it('custom fields enrichment', function() {
		var self = this;
		var tweet = new Tweet();
		tweet.text = 'test';
		tweet.bg = 'bgvalue';
		tweet.actor = this.actor;
		tweet.link = this.link;

		return tweet.save
			.promisify(tweet)
			.then(function() {
				return tweet.populate.promisify(tweet, ['actor', 'link']);
			})
			.then(function(tweet) {
				var activity = tweet.createActivity();

				return backend.enrichActivities([activity]);
			})
			.then(function(enriched) {
				enriched.should.length(1);
				enriched[0].should.have.property('actor');
				enriched[0]['actor'].should.have.property('_id', self.actor._id);
				enriched[0].should.have.property('object');
				enriched[0]['object'].should.have.property('_id', tweet._id);
				enriched[0]['object'].should.have.property('text', tweet.text);
				enriched[0].should.have.property('bg', 'bgvalue');
				enriched[0].should.have.property('link');
				enriched[0]['link'].should.have.property('_id', self.link._id);
			});
	});

	it('custom fields serialisation', function() {
		var tweet = new Tweet();
		tweet.text = 'test';
		tweet.bg = 'bgvalue';
		tweet.actor = this.actor;
		tweet.link = this.link;

		return tweet.save
			.promisify(tweet)
			.then(function() {
				return tweet.populate.promisify(tweet, ['actor', 'link']);
			})
			.then(function(tweet) {
				var activity = tweet.createActivity();
				tweet.getStreamBackend().serializeActivities([activity]);
				activity.should.have.property('actor', 'User:' + tweet.actor._id);
				activity.should.have.property('link', 'Link:' + tweet.link._id);
				activity.should.have.property('bg', 'bgvalue');
				activity.should.have.property('object', 'Tweet:' + tweet._id);
			});
	});

	it('serialise objects into refs', function() {
		var tweet = new Tweet();
		tweet.text = 'test';
		tweet.actor = this.actor;

		return tweet.save
			.promisify(tweet)
			.then(function() {
				return tweet.populate.promisify(tweet, 'actor');
			})
			.then(function() {
				var activity = tweet.createActivity();
				tweet.getStreamBackend().serializeActivities([activity]);

				activity.should.have.property('actor', 'User:' + tweet.actor._id);
				activity.should.have.property('object', 'Tweet:' + tweet._id);
			});
	});

	it('enrich two activity', function() {
		var tweet1 = new Tweet();
		tweet1.text = 'test1';
		tweet1.actor = this.actor;

		var tweet2 = new Tweet();
		tweet2.text = 'test2';
		tweet2.actor = this.actor;

		return Promise.all([
			tweet1.save.promisify(tweet1),
			tweet2.save.promisify(tweet2)
		])
			.then(function() {
				var activities = [
					tweet1.createActivity(),
					tweet2.createActivity()
				];

				return backend.enrichActivities(activities);
			})
			.then(function(enriched) {
				enriched.should.length(2);
				enriched[0].should.have.property('foreign_id');
				enriched[1].should.have.property('foreign_id');
				enriched[0]['foreign_id'].should.not.equal(enriched[1]['foreign_id']);
			});
	});
});

describe('Tweet', function() {
	before(function(done) {
		var actor = new User({ name: 'actor1' });
		actor.save();
		this.actor = actor;
		done();
	});

	it('should follow model reference naming convention', function() {
		Tweet.activityModelReference().should.be.exactly('Tweet');
	});

	it('check to target field', function() {
		var tweet = new Tweet({});
		tweet.actor = this.actor;
		tweet.save();
		var activity = tweet.createActivity();
		activity.should.have.property('to', [
			'notification:1',
			'notification:2'
		]);
	});

	it('should be able to serialise to ref', function() {
		var tweet = new Tweet({});
		var ref = tweet.getStreamBackend().serializeValue(tweet);
		ref.should.be.exactly('Tweet:' + tweet._id);
	});

	it('#createActivity().activityVerb', function() {
		var tweet = new Tweet({});
		tweet.actor = this.actor;
		tweet.save();
		var activity = tweet.createActivity();
		activity.should.have.property('verb', 'Tweet');
	});

	it('#createActivity.activityObject', function() {
		var tweet = new Tweet({});
		tweet.actor = this.actor;
		tweet.save();
		var activity = tweet.createActivity();
		activity.should.have.property('object');
	});

	it('#createActivity.activityActor', function() {
		var tweet = new Tweet({});
		tweet.actor = this.actor;
		tweet.save();
		var activity = tweet.createActivity();
		activity.should.have.property('actor');
	});
});
