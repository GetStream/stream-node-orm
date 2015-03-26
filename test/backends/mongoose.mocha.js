var async = require("async");
var should = require('should');
var StreamMongoose = require('../../src/ORM/Mongoose'); 
var mongoose = require('mongoose');
var stream = require('../../src/GetStreamNode.js');

mongoose.connect('mongodb://localhost/test');

var schema = new mongoose.Schema({
  name: String,
  actor: String
});

StreamMongoose.activitySchema(schema);

schema.methods.activityActorProp = function(){
  return 'actor';
}

var Tweet = mongoose.model('Tweet', schema);
StreamMongoose.activityModel(Tweet);

describe('Enricher', function() {

    it('enrich one activity', function() {
        var tweet = new Tweet();
        tweet.name = 'test';
        tweet.actor = 'plainActor';
        tweet.save(function(err) {
            var activity = tweet.createActivity();
            var enricher = new stream.Enricher();
            enricher.enrichActivities([activity], function(err, enriched){
              enriched.should.length(1);
              console.log(enriched[0])
              enriched[0].should.have.property('actor');
              enriched[0].should.have.property('object');
              enriched[0]['object'].should.have.property('_id', tweet._id);
              enriched[0]['object'].should.have.property('name', tweet.name);
            });
        });
    });

    it('enrich two activity', function() {
        var enricher = new stream.Enricher();
        var tweet1 = new Tweet();
        tweet1.name = 'test1';
        tweet1.actor = 'plainActor1';
        var tweet2 = new Tweet();
        tweet2.name = 'test2';
        tweet2.actor = 'plainActor2';

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

    it('should follow model reference naming convention', function() {
        (Tweet.activityModelReference()).should.be.exactly('MongooseTweet');
    });

    it('should be registered in the manager', function() {
        var cls = stream.FeedManager.getActivityClass(Tweet.activityModelReference());
        (cls).should.be.exactly(Tweet)
    });

    it('#createActivity().activityVerb', function() {
        var tweet = new Tweet({});
        tweet.actor = 'actor';
        tweet.save();
        var activity = tweet.createActivity();
        activity.should.have.property('verb', 'Tweet');
    });

    it('#createActivity.activityObject', function() {
        var tweet = new Tweet({});
        tweet.actor = 'actor';
        tweet.save();
        var activity = tweet.createActivity();
        activity.should.have.property('object');
    });

    it('#createActivity.activityActor', function() {
        var tweet = new Tweet({});
        tweet.actor = 'actor';
        tweet.save();
        var activity = tweet.createActivity();
        activity.should.have.property('actor');
    });

});
