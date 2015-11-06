var FeedManager = require('./FeedManager.js');
var config = require('./config.js');
var settings = config();
var BaseBackend = require('./backends/base.js');

module.exports.FeedManager = new FeedManager(settings);
module.exports.feedManagerFactory = function (options) {
	options = options || {};

	for(var key in settings) {
		if(settings.hasOwnProperty(key) && options.hasOwnProperty(key)) {
			settings[key] = options[key];
		} 
	}

	return new FeedManager(settings);
}
module.exports.BaseBackend = BaseBackend;
module.exports.mongoose = require('./backends/mongoose.js');
module.exports.settings = settings;
