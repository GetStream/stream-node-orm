var FeedManager = require('./FeedManager.js');
var config = require('./config.js');
var settings = config();
var extend = require('util')._extend;
var waterline = require('./backends/waterline');
var mongoose = require('./backends/mongoose.js');

module.exports.FeedManager = new FeedManager(settings);
module.exports.feedManagerFactory = function(options) {
	var withSettings = extend({}, settings);
	options = options || {};

	for (var key in withSettings) {
		if (withSettings.hasOwnProperty(key) && options.hasOwnProperty(key)) {
			withSettings[key] = options[key];
		}
	}

	return new FeedManager(withSettings);
};

module.exports.mongoose = mongoose;
module.exports.settings = settings;
module.exports.WaterlineBackend = waterline.Backend;
module.exports.MongooseBackend = mongoose.Backend;
