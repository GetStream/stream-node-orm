var async = require("async");
var should = require('should');
var StreamMongoose = require('../../src/backends/Mongoose'); 
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var stream = require('../../src/GetStreamNode.js');

mongoose.connect('mongodb://localhost/test');

var userSchema = Schema({
  name    : String
});

var tweetSchema = Schema({
  text    : String,
  actor   : { type: Schema.Types.ObjectId, ref: 'User' }
});

StreamMongoose.activitySchema(tweetSchema);

tweetSchema.statics.pathsToPopulate = function(){
  return 'actor';
};

tweetSchema.methods.activityActorProp = function(){
  return 'actor';
}

var Tweet = mongoose.model('Tweet', tweetSchema);
StreamMongoose.activityModel(Tweet);

var User = mongoose.model('User', userSchema);

describe('Enricher', function() {

    before(function(done) {
      actor = new User({'name': 'actor1'});
      actor.save();
      this.actor = actor;
      done();
    });

    it('serialise objects into refs', function() {
        var self = this;
        var tweet = new Tweet();
        tweet.text = 'test';
        tweet.actor = this.actor;
        tweet.save(function(err) {
            var activity = tweet.createActivity();
            tweet.getStreamBackend().serializeActivities([activity]);
            (activity).should.have.property('actor', 'User:' + tweet.actor._id);
            (activity).should.have.property('object', 'Tweet:' + tweet._id);
        });
    });

    it('enrich one activity', function() {
        var self = this;
        var tweet = new Tweet();
        tweet.text = 'test';
        tweet.actor = this.actor;
        tweet.save(function(err) {
            var activity = tweet.createActivity();
            var enricher = new StreamMongoose.Backend();
            enricher.enrichActivities([activity], function(err, enriched){
              enriched.should.length(1);
              enriched[0].should.have.property('actor');
              enriched[0]['actor'].should.have.property('_id', self.actor._id);
              enriched[0].should.have.property('object');
              enriched[0]['object'].should.have.property('_id', tweet._id);
              enriched[0]['object'].should.have.property('text', tweet.text);
            });
        });
    });

    it('enrich two activity', function() {
        var enricher = new StreamMongoose.Backend();
        var tweet1 = new Tweet();
        tweet1.text = 'test1';
        actor = new User({'name': 'actor1'});
        tweet1.actor = actor._id;
        var tweet2 = new Tweet();
        tweet2.text = 'test2';
        actor2 = new User({'name': 'actor1'});
        tweet2.actor = actor2._id;

        async.each([tweet1, tweet2], 
          function(obj, done){
            obj.save(function(err) { done()})
          },
          function(){
            var activities = [tweet1.createActivity(), tweet2.createActivity()];
            enricher.enrichActivities(activities,
              function(err, enriched){
                enriched.should.length(2);
                enriched[0].should.have.property('foreign_id');
                enriched[1].should.have.property('foreign_id');
                enriched[0]['foreign_id'].should.not.equal(enriched[1]['foreign_id']);
              }
            )}
          );
      });

});

describe('Tweet', function() {

    before(function(done) {
      actor = new User({'name': 'actor1'});
      actor.save();
      this.actor = actor;
      done();
    });

    it('should follow model reference naming convention', function() {
        (Tweet.activityModelReference()).should.be.exactly('Tweet');
    });

    it('should be able to serialise to ref', function() {
      var tweet = new Tweet({});
      var ref = tweet.getStreamBackend().serializeValue(tweet);
      (ref).should.be.exactly('Tweet:'+tweet._id);
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
