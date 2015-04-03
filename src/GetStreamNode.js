var FeedManager = require('./FeedManager.js');
var Mongoose = require('./backends/Mongoose.js');
var config = require('./config.js');
var settings = config();
var BaseBackend = require('./backends/base.js');

// TODO: make sure this happens only once!
module.exports.FeedManager = new FeedManager(settings);
module.exports.mongoose = Mongoose;
module.exports.BaseBackend = BaseBackend;
