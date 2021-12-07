let should = require("should"),
  {
    activity,
    setupMongoose,
    Backend,
  } = require("../../src/backends/mongoose.js"),
  mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  stream = require("../../src/index.js"),
  Promise = require("promise"),
  sinon = require("sinon"),
  mockery = require("mockery");

require("../utils/promise");

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let userSchema = new Schema({
  name: String,
});

let linkSchema = new Schema({
  href: String,
});

let tweetSchema = new Schema({
  text: String,
  actor: { type: Schema.Types.ObjectId, ref: "User" },
  bg: String,
  link: { type: Schema.Types.ObjectId, ref: "Link" },
});

tweetSchema.plugin(activity);

tweetSchema.statics.pathsToPopulate = function () {
  return ["actor", "link"];
};

tweetSchema.methods.activityNotify = function () {
  return [
    stream.FeedManager.getFeed("notification", "1"),
    stream.FeedManager.getFeed("notification", "2"),
  ];
};

tweetSchema.methods.activityExtraData = function () {
  return { bg: this.bg, link: this.link };
};

tweetSchema.methods.activityActorProp = function () {
  return "actor";
};

setupMongoose(mongoose);

let Tweet = mongoose.model("Tweet", tweetSchema);
let User = mongoose.model("User", userSchema);
let Link = mongoose.model("Link", linkSchema);
let backend = new Backend();

describe("Backend", function () {
  let requestStub;

  before(function (done) {
    let actor = new User({ name: "actor1" });
    let link;

    let save = Promise.denodeify(actor.save);

    save
      .call(actor)
      .then(
        function () {
          this.actor = actor;
          link = new Link({ href: "https://getstream.io" });
          let linkSave = Promise.denodeify(link.save);
          return linkSave.call(link);
        }.bind(this),
        done
      )
      .then(
        function () {
          this.link = link;
          done();
        }.bind(this),
        done
      );

    // replace the module `request` with a stub object
    mockery.enable({ warnOnReplace: false, warnOnUnregistered: false });
    requestStub = sinon.stub();
    mockery.registerMock("request", requestStub);
  });

  after(function () {
    mockery.disable();
  });

  it("serialise null", function (done) {
    let activity = { object: null };
    backend.serializeActivities([activity]);
    backend
      .enrichActivities([activity])
      .then(function (enriched) {
        should(enriched).length(1);
        should(enriched[0]).have.property("object", null);
        done();
      })
      .catch(done);
  });

  it("dont enrich origin field", function (done) {
    let activity = { origin: "user:42" };
    backend
      .enrichActivities([activity])
      .then(function (enriched) {
        should(enriched).length(1);
        should(enriched[0]).have.property("origin", "user:42");
        done();
      })
      .catch(done);
  });

  it("enrich aggregated activity complex mix", function (done) {
    let tweet1 = new Tweet();
    tweet1.text = "tweet1";
    tweet1.actor = this.actor;

    let tweet2 = new Tweet();
    tweet2.text = "tweet2";
    tweet2.actor = this.actor;

    let tweets = [tweet1, tweet2];

    Tweet.create(tweets, function (err) {
      // should.not.exist(err);
      let activities = [tweet1.createActivity()];
      let activities2 = [tweet2.createActivity()];

      backend.serializeActivities(activities);
      backend.serializeActivities(activities2);
      let aggregatedActivities = [
        { actor_count: 1, activities: activities },
        { actor_count: 1, activities: activities2 },
      ];
      backend
        .enrichAggregatedActivities(aggregatedActivities)
        .then(function (enriched) {
          should(enriched).length(2);
          let firstAggregation = enriched[0];
          let secondAggregation = enriched[1];
          should(firstAggregation).have.property("activities").with.lengthOf(1);
          should(firstAggregation["activities"][0]).have.property("actor");
          should(firstAggregation["activities"][0]).have.property("object");
          should(firstAggregation["activities"][0].object).have.property("_id");
          should(firstAggregation["activities"][0]).have.property("verb");
          should(secondAggregation["activities"][0]).have.property("actor");
          should(secondAggregation["activities"][0]).have.property("object");
          should(secondAggregation["activities"][0].object).have.property(
            "_id"
          );
          should(secondAggregation["activities"][0]).have.property("verb");
          should(firstAggregation["activities"][0].object._id).not.equal(
            secondAggregation["activities"][0].object._id
          );
          done();
        })
        .catch(done);
    });
  });

  it("enrich aggregated activity", function (done) {
    let tweet = new Tweet();
    tweet.text = "test";
    tweet.actor = this.actor;
    tweet.save(function (err) {
      should.not.exist(err);
      let activity = tweet.createActivity();
      backend.serializeActivities([activity]);
      let aggregatedActivities = [{ actor_count: 1, activities: [activity] }];
      backend
        .enrichAggregatedActivities(aggregatedActivities)
        .then(function (enriched) {
          enriched.should.length(1);
          enriched[0].should.have.property("activities").with.lengthOf(1);
          enriched[0]["activities"][0].should.have.property("actor");
          enriched[0]["activities"][0].should.have.property("object");
          enriched[0]["activities"][0].should.have.property("verb");
          done();
        })
        .catch(done);
    });
  });

  it("enrich aggregated activity with 2 groups", function (done) {
    let tweet = new Tweet();
    tweet.text = "test";
    tweet.actor = this.actor;
    tweet.save(function (err) {
      should.not.exist(err);
      let activity = tweet.createActivity();
      backend.serializeActivities([activity]);
      let aggregatedActivities = [
        { actor_count: 1, activities: [activity] },
        { actor_count: 1, activities: [activity, activity] },
      ];
      backend
        .enrichAggregatedActivities(aggregatedActivities)
        .then(function (enriched) {
          enriched.should.length(2);
          enriched[0].should.have.property("activities").with.lengthOf(1);
          enriched[0]["activities"][0].should.have.property("actor");
          enriched[0]["activities"][0].should.have.property("object");
          enriched[0]["activities"][0].should.have.property("verb");

          enriched[1].should.have.property("activities").with.lengthOf(2);
          enriched[1]["activities"][0].should.have.property("actor");
          enriched[1]["activities"][0].should.have.property("object");
          enriched[1]["activities"][0].should.have.property("verb");
          done();
        })
        .catch(done);
    });
  });

  it("delete activity", function (done) {
    let tweet = new Tweet();
    tweet.text = "test";
    tweet.actor = this.actor;
    tweet.save(function (err) {
      if (err) return done(err);
      tweet.remove(done);
    });
  });

  it("enrich one activity", function () {
    let self = this;
    let tweet = new Tweet();
    tweet.text = "test";
    tweet.actor = this.actor;

    return tweet.save
      .promisify(tweet)
      .then(function () {
        return tweet.populate.promisify(tweet, "actor");
      })
      .then(function (tweet) {
        let activity = tweet.createActivity();

        backend.serializeActivities([activity]);
        activity = JSON.parse(JSON.stringify(activity));

        return backend.enrichActivities([activity]);
      })
      .then(function (enriched) {
        enriched.should.length(1);
        enriched[0].should.have.property("actor");
        enriched[0]["actor"].should.have.property("_id", self.actor._id);
        enriched[0].should.have.property("foreign_id", "Tweet:" + tweet._id);
      });
  });

  it("custom fields enrichment", function () {
    let self = this;
    let tweet = new Tweet();
    tweet.text = "test";
    tweet.bg = "bgvalue";
    tweet.actor = this.actor;
    tweet.link = this.link;

    return tweet.save
      .promisify(tweet)
      .then(function () {
        return tweet.populate.promisify(tweet, ["actor", "link"]);
      })
      .then(function (tweet) {
        let activity = tweet.createActivity();

        return backend.enrichActivities([activity]);
      })
      .then(function (enriched) {
        enriched.should.length(1);
        enriched[0].should.have.property("actor");
        enriched[0]["actor"].should.have.property("_id", self.actor._id);
        enriched[0].should.have.property("object");
        enriched[0]["object"].should.have.property("_id", tweet._id);
        enriched[0]["object"].should.have.property("text", tweet.text);
        enriched[0].should.have.property("bg", "bgvalue");
        enriched[0].should.have.property("link");
        enriched[0]["link"].should.have.property("_id", self.link._id);
      });
  });

  it("custom fields serialisation", function () {
    let tweet = new Tweet();
    tweet.text = "test";
    tweet.bg = "bgvalue";
    tweet.actor = this.actor;
    tweet.link = this.link;

    return tweet.save
      .promisify(tweet)
      .then(function () {
        return tweet.populate.promisify(tweet, ["actor", "link"]);
      })
      .then(function (tweet) {
        let activity = tweet.createActivity();
        tweet.getStreamBackend().serializeActivities([activity]);
        activity.should.have.property("actor", "User:" + tweet.actor._id);
        activity.should.have.property("link", "Link:" + tweet.link._id);
        activity.should.have.property("bg", "bgvalue");
        activity.should.have.property("object", "Tweet:" + tweet._id);
      });
  });

  it("serialise objects into refs", function () {
    let tweet = new Tweet();
    tweet.text = "test";
    tweet.actor = this.actor;

    return tweet.save
      .promisify(tweet)
      .then(function () {
        return tweet.populate.promisify(tweet, "actor");
      })
      .then(function () {
        let activity = tweet.createActivity();
        tweet.getStreamBackend().serializeActivities([activity]);
        activity.should.have.property("actor", "User:" + tweet.actor._id);
        activity.should.have.property("object", "Tweet:" + tweet._id);
      });
  });

  it("enrich two activity", function () {
    let tweet1 = new Tweet();
    tweet1.text = "test1";
    tweet1.actor = this.actor;

    let tweet2 = new Tweet();
    tweet2.text = "test2";
    tweet2.actor = this.actor;

    return Promise.all([
      tweet1.save.promisify(tweet1),
      tweet2.save.promisify(tweet2),
    ])
      .then(function () {
        let activities = [tweet1.createActivity(), tweet2.createActivity()];

        return backend.enrichActivities(activities);
      })
      .then(function (enriched) {
        enriched.should.length(2);
        enriched[0].should.have.property("foreign_id");
        enriched[1].should.have.property("foreign_id");
        enriched[0]["foreign_id"].should.not.equal(enriched[1]["foreign_id"]);
      });
  });
});

describe("Tweet", function () {
  before(function (done) {
    let actor = new User({ name: "actor1" });
    actor.save();
    this.actor = actor;
    done();
  });

  it("should follow model reference naming convention", function () {
    Tweet.activityModelReference().should.be.exactly("Tweet");
  });

  it("check to target field", function () {
    let tweet = new Tweet({});
    tweet.actor = this.actor;
    tweet.save();
    let activity = tweet.createActivity();
    activity.should.have.property("to", ["notification:1", "notification:2"]);
  });

  it("should be able to serialise to ref", function () {
    let tweet = new Tweet({});
    let ref = tweet.getStreamBackend().serializeValue(tweet);
    ref.should.be.exactly("Tweet:" + tweet._id);
  });

  it("#createActivity().activityVerb", function () {
    let tweet = new Tweet({});
    tweet.actor = this.actor;
    tweet.save();
    let activity = tweet.createActivity();
    activity.should.have.property("verb", "Tweet");
  });

  it("#createActivity.activityObject", function () {
    let tweet = new Tweet({});
    tweet.actor = this.actor;
    tweet.save();
    let activity = tweet.createActivity();
    activity.should.have.property("object");
  });

  it("#createActivity.activityActor", function () {
    let tweet = new Tweet({});
    tweet.actor = this.actor;
    tweet.save();
    let activity = tweet.createActivity();
    activity.should.have.property("actor");
  });
});
