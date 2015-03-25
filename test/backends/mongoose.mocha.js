var should = require('should');
var StreamMongoose = require('../../src/ORM/Mongoose'); 
var mongoose = require('mongoose');
var stream = require('../../src/GetStreamNode.js');

var schema = new mongoose.Schema({ name: 'string', size: 'string' });
var Tweet = mongoose.model('Tweet', schema);

StreamMongoose.ActivityModel(Tweet);

describe('Tweet', function() {

    it('should be registered in the manager', function() {
        var tweet = new Tweet({});
        (tweet.activity_model_reference()).should.be.exactly('MongooseTweet');
    });

    it('should be registered in the manager', function() {
        var tweet = new Tweet({});
        var cls = stream.FeedManager.getModelClass(tweet.activity_model_reference());
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
