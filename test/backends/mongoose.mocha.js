var async = require("async");
var should = require('should');
var StreamMongoose = require('../../src/ORM/Mongoose'); 
var mongoose = require('mongoose');
var stream = require('../../src/GetStreamNode.js');

mongoose.connect('mongodb://localhost/test');

var schema = new mongoose.Schema({ name: String });
StreamMongoose.activitySchema(schema);

var Tweet = mongoose.model('Tweet', schema);
StreamMongoose.activityModel(Tweet);

describe('Enricher', function() {

    it('enrich one activity', function() {
        var tweet = new Tweet();
        tweet.name = 'test';
        tweet.save(function(err) {
            var activity = tweet.create_activity();
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
        var tweet2 = new Tweet();
        tweet2.name = 'test2';

        async.each([tweet1, tweet2], 
          function(obj, done){
            obj.save(function(err) { done()})
          },
          function(){
            var activities = [tweet1.create_activity(), tweet2.create_activity()];
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
        (Tweet.activity_model_reference()).should.be.exactly('MongooseTweet');
    });

    it('should be registered in the manager', function() {
        var cls = stream.FeedManager.getActivityClass(Tweet.activity_model_reference());
        (cls).should.be.exactly(Tweet)
    });

    it('#create_activity().activity_verb', function() {
        var tweet = new Tweet({});
        tweet.save();
        var activity = tweet.create_activity();
        activity.should.have.property('verb', 'Tweet');
    });

    it('#create_activity.activity_object', function() {
        var tweet = new Tweet({});
        tweet.save();
        var activity = tweet.create_activity();
        activity.should.have.property('object');
    });

    it('#create_activity.activity_actor', function() {
        var tweet = new Tweet({});
        tweet.save();
        var activity = tweet.create_activity();
        activity.should.have.property('actor');
    });

});
