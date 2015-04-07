var FeedManager = require('./FeedManager.js');
var config = require('./config.js');
var settings = config();
var BaseBackend = require('./backends/base.js');

// TODO: make sure this happens only once!
module.exports.FeedManager = new FeedManager(settings);
module.exports.BaseBackend = BaseBackend;
module.exports.mongoose = require('./backends/mongoose.js');
