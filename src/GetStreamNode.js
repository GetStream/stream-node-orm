var FeedManager = require('./lib/FeedManager')
var config = require('./lib/config');
var settings = config();

if (typeof settings.ORM != 'undefined') {
  switch (settings.ORM) {
    case 'mongoose':
      Activity = require('./lib/Mongoose/Activity');
      break;
    default:
      Activity = null;
  } 

  module.exports.Activity = Activity;
}

module.exports.FeedManager = new FeedManager(settings);