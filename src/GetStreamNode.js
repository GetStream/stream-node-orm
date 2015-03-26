var FeedManager = require('./FeedManager.js');
var Mongoose = require('./ORM/Mongoose.js');
var config = require('./config.js');
var settings = config();
var Enricher = require('./Enricher.js');

// TODO: make sure this happens only once!
module.exports.FeedManager = new FeedManager(settings);
module.exports.mongoose = Mongoose;
module.exports.Enricher = Enricher;
