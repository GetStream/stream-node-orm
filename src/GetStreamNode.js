var FeedManager = require('./lib/FeedManager');
var Mongoose = require('./lib/ORM/Mongoose');
var config = require('./lib/config');
var settings = config();

module.exports.FeedManager = new FeedManager(settings);
module.exports.Mongoose = Mongoose;