var FeedManager = require('./lib/FeedManager');
var Mongoose = require('./lib/ORM/Mongoose');
var Enricher = require('./lib/Enricher');
var config = require('./lib/config');
var settings = config();

module.exports.FeedManager = new FeedManager(settings);
module.exports.mongoose = Mongoose;
module.exports.Enricher = Enricher;