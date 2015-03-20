var FeedManager = require('./lib/FeedManager');
var Mongoose = require('./lib/ORM/Mongoose');
var config = require('./lib/config');
var settings = config();

module.exports.mongoose = new Mongoose;
module.exports.FeedManager = new FeedManager(settings);