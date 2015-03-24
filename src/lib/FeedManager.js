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
    // placeholder function for now
    console.log(activity);
    feed = this.getFeed(this.settings.userFeed, activity.actor);
    feed.removeActivity({'foreignId': activity.foreign_id}, function(err, response, body) {
      if (err) console.log(err);
      console.log(response.body);
    });

    console.log('activity deleted!');
  }

};

module.exports = FeedManager;