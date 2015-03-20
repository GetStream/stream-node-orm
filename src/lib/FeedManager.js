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

    // include heroku support
    if (typeof(process) != "undefined" && process.env.STREAM_URL) {
      this.client = stream.connect();
    } else {
      this.client = stream.connect(this.settings.apiKey, this.settings.apiSecret, this.settings.apiAppId, options);
    }

    console.log('getstream-node initialized!');
  },


  getUserFeed: function(userId) {
    return this.client.feed(userFeed, userId);
  },

  getNotificationFeed: function(userId) {
    return this.client.feed(notificationFeed, userId);
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


  // functions for future ORM observers

  activityCreated: function(instance) {
    // placeholder function for now
    feed = this.getFeed(this.settings.userFeed, instance.userId);
    feed.addActivity(instance.activity, function(error, response, body) {
      console.log(error);
      console.log(instance.activity);
      console.log(response.body);
    });

  },


  activityDeleted: function(activity) {
    // placeholder function for now
    feed = this.getFeed(this.settings.userFeed, activity.actor);
    feed.removeActivity({'foreignId': activity.foreign_id});

    console.log('activity created!');
  }

};

module.exports = FeedManager;