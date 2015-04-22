var FeedManager = require('./FeedManager.js');
var config = require('./config.js');
var settings = config();
var BaseBackend = require('./backends/base.js');

module.exports.FeedManager = new FeedManager(settings);
module.exports.BaseBackend = BaseBackend;
module.exports.mongoose = require('./backends/mongoose.js');
module.exports.settings = settings;
