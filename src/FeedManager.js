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

  trackingEnabled: function(instance) {
    return true;
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
    this._registeredModels[model.activityModelReference()] = model;
  },

  activityCreated: function(instance) {
    if (this.trackingEnabled(instance)){
      var activity = instance.createActivity();
      var feedType = instance.activityActorFeed() || this.settings.userFeed;
      var userId = instance.activityActorId();
      feed = this.getFeed(feedType, userId);
      feed.addActivity(activity, function(err, response, body) {
        if (err) console.log(err);
      });
    }
  },

  activityDeleted: function(instance) {
    if (this.trackingEnabled(instance)){
      var activity = instance.createActivity();
      feed = this.getFeed(this.settings.userFeed, activity.actor);
      feed.removeActivity({'foreignId': activity.foreign_id}, function(err, response, body) {
        if (err) console.log(err);
      });
    }
  }

};

module.exports = FeedManager;
