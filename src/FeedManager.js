var stream = require('getstream');

var FeedManager = function () {
  this.initialize.apply(this, arguments);
};

FeedManager.prototype = {

  initialize: function(settings) {

    this.settings = settings;
    this._registeredModels = {};

    options = {};

    if (this.settings.apiLocation != "") {
      options.location = this.settings.apiLocation;
    }

    // include heroku support
    if (typeof(process) != "undefined" && process.env.STREAM_URL) {
      this.client = stream.connect();
    } else {
      this.client = stream.connect(this.settings.apiKey, this.settings.apiSecret, this.settings.apiAppId, options);
    }

  },

  getUserFeed: function(userId) {
    return this.client.feed(this.settings.userFeed, userId);
  },

  getNotificationFeed: function(userId) {
    return this.client.feed(this.settings.notificationFeed, userId);
  },
  
  getNewsFeeds: function(userId) {
    feeds = [];
    newsFeeds = this.settings.newsFeeds;

    for (key in newsFeeds) {
      slug = newsFeeds[key];
      feeds[slug] = this.client.feed(slug, userId);
    }

    return feeds;
  },

  followUser: function(userId, targetUserId) {
    newsFeeds = this.getNewsFeeds(userId);

    for (slug in newsFeeds) {
      newsFeeds[slug].follow(this.settings.userFeed, targetUserId);
    }
  },

  unfollowUser: function(userId, targetUserId) {
    newsFeeds = this.getNewsFeeds(userId);

    for (slug in newsFeeds) {
      newsFeeds[slug].unfollow(this.settings.userFeed, targetUserId);
    }
  },

  getFeed: function(slug, userId) {
    return this.client.feed(slug, userId);
  },

  getActivityClass: function(modelReference) {
    return this._registeredModels[modelReference];
  },

  registerActivityClass: function(model) {
    this._registeredModels[model.activity_model_reference()] = model;
  },

  // functions for future ORM observers
  activityCreated: function(instance) {
    // placeholder function for now
    feed = this.getFeed(this.settings.userFeed, instance.userId);
    feed.addActivity(instance.activity, function(err, response, body) {
      if (err) console.log(err);
      console.log(instance.activity);
      console.log(response.body);
    });
  },

  activityDeleted: function(activity) {
    feed = this.getFeed(this.settings.userFeed, activity.actor);
    feed.removeActivity({'foreignId': activity.foreign_id}, function(err, response, body) {
      if (err) console.log(err);
      console.log(response.body);
    });
  }

};

module.exports = FeedManager;
