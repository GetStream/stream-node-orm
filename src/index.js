var FeedManager = require('./FeedManager.js');
var config = require('./config.js');
var settings = config();
var waterline = require('./backends/waterline');
var mongoose = require('./backends/mongoose.js');

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

module.exports.mongoose = mongoose;
module.exports.settings = settings;
module.exports.WaterlineBackend = waterline.Backend;
module.exports.MongooseBackend = mongoose.Backend;
