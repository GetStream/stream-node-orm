var stream = require('getstream'),
	Promise = require('promise');
var FeedManager = function() {
	this.initialize.apply(this, arguments);
};

FeedManager.prototype = {
	initialize: function(settings) {
		this.settings = settings;

		var options = {};

		if (this.settings.apiLocation != '') {
			options.location = this.settings.apiLocation;
		}

		if (typeof process !== 'undefined' && process.env.STREAM_URL) {
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
		var feeds = [];
		var newsFeeds = this.settings.newsFeeds;

		for (var key in newsFeeds) {
			var slug = newsFeeds[key];
			feeds[slug] = this.client.feed(slug, userId);
		}

		return feeds;
	},

	followUser: function(userId, targetUserId) {
		var newsFeeds = this.getNewsFeeds(userId);
		var ps = [];

		for (var slug in newsFeeds) {
			var p = newsFeeds[slug].follow(this.settings.userFeed, targetUserId);
			ps.push(p);
		}

		return Promise.all(ps);
	},

	unfollowUser: function(userId, targetUserId) {
		var newsFeeds = this.getNewsFeeds(userId);
		var ps = [];

		for (var slug in newsFeeds) {
			var p = newsFeeds[slug].unfollow(this.settings.userFeed, targetUserId);
			ps.push(p);
		}

		return Promise.all(ps);
	},

	getFeed: function(slug, userId) {
		return this.client.feed(slug, userId);
	},

	activityCreated: function(instance) {
		if (this.trackingEnabled(instance)) {
			var activity = instance.createActivity();
			var backend = instance.getStreamBackend();

			backend.serializeActivities([activity]);

			var feedType =
				instance.activityActorFeed() || this.settings.userFeed;
			var userId = backend.getIdFromRef(activity.actor);
			var feed = this.getFeed(feedType, userId);

			return feed.addActivity(activity);
		}
	},

	activityDeleted: function(instance) {
		if (this.trackingEnabled(instance)) {
			var activity = instance.createActivity();
			var backend = instance.getStreamBackend();

			backend.serializeActivities([activity]);

			var feedType =
				instance.activityActorFeed() || this.settings.userFeed;
			var userId = backend.getIdFromRef(activity.actor);
			var feed = this.getFeed(feedType, userId);

			return feed.removeActivity({ foreignId: activity.foreign_id });
		}
	},
};

module.exports = FeedManager;
