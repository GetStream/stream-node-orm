var should = require('should');
var StreamMongoose = require('../../src/ORM/Mongoose'); 
var mongoose = require('mongoose');

var Tweet = mongoose.model('Tweet', { name: String, user: String });
StreamMongoose.ActivityModel(Tweet);

describe('Tweet', function() {

    it('#activity_verb()', function() {
    });

    it('#activity_object()', function() {
    });

    it('#activity_foreign_id()', function() {
    });

    it('#activity_actor()', function() {
    });

});
