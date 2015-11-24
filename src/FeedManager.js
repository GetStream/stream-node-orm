var stream = require('getstream');

var FeedManager = function () {
  this.initialize.apply(this, arguments);
};

FeedManager.prototype = {

  initialize: function(settings) {
    this.settings = settings;

    options = {};

    if (this.settings.apiLocation != "") {
      options.location = this.settings.apiLocation;
    }

    if (typeof(process) !== "undefined" && process.env.STREAM_URL) {
      this.client = stream.connect();
    } else {
      this.client = stream.connect(this.settings.apiKey, this.settings.apiSecret, this.settings.apiAppId, options);
    }
    
  },

  trackingEnabled: function(instance) {
    return process.env.NODE_ENV === 'test' ? false : true;
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

  activityCreated: function(instance) {
    if (this.trackingEnabled(instance)) {
      var activity = instance.createActivity();
      var backend = instance.getStreamBackend();
      backend.serializeActivities([activity]);
      var feedType = instance.activityActorFeed() || this.settings.userFeed;
      var userId = backend.getIdFromRef(activity.actor);
      feed = this.getFeed(feedType, userId);
      feed.addActivity(activity, function(err, response, body) {
        if (err) console.log('err: ', err);
      });
    }
  },

  activityDeleted: function(instance) {
    if (this.trackingEnabled(instance)) {
      var activity = instance.createActivity();
      var backend = instance.getStreamBackend();
      backend.serializeActivities([activity]);
      var feedType = instance.activityActorFeed() || this.settings.userFeed;
      var userId = backend.getIdFromRef(activity.actor);
      feed = this.getFeed(feedType, userId);
      feed.removeActivity({'foreignId': activity.foreign_id}, function(err, response, body) {
        if (err) console.log('err: ', err);
      });
    }
  }

};

module.exports = FeedManager;
