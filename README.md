##Stream NodeJS

[![Build Status](https://travis-ci.org/tbarbugli/stream-node.svg)](https://travis-ci.org/tbarbugli/stream-node)
[![npm version](https://badge.fury.io/js/getstream-node.svg)](http://badge.fury.io/js/getstream-node)

This package helps you create activity streams & newsfeeds with NodeJS and [GetStream.io](https://getstream.io).

###Build activity streams & news feeds

<p align="center">
  <img src="https://dvqg2dogggmn6.cloudfront.net/images/mood-home.png" alt="Examples of what you can build" title="What you can build"/>
</p>

You can build:

* Activity streams such as seen on Github
* A twitter style newsfeed
* A feed like instagram/ pinterest
* Facebook style newsfeeds
* A notification system

### Demo

You can check out our example app built using this library on Github [https://github.com/GetStream/Stream-Example-Nodejs](https://github.com/GetStream/Stream-Example-Nodejs)

###Installation

Install getstream_node package with npm:

```npm install getstream-node```

Copy `getstream.js` config file from `node_modules/getstream-node` into the root directory of your application  

Login with Github on getstream.io and edit the configuration values for 
```apiKey```, ```apiSecret``` and ```apiAppId``` in your `getstream.js` file (you can find them in the dashboard).

Make sure you require the getstream-node early on in your application (eg. in app.js)


###Model integration

Stream Nodejs can automatically publish new activities to your feeds. To do that you only need to register the models you want to publish with this library.

```js
var stream = require('getstream-node');

var tweetSchema = Schema({
  text    : String,
  user   : { type: Schema.Types.ObjectId, ref: 'User' }
});

tweetSchema.plugin(stream.mongoose.activity);

// register your mongoose connection with the library
stream_node.mongoose.setupMongoose(mongoose);
```

Every time a Tweet is created it will be added to the user's feed. Users which follow the given user will also automatically get the new tweet in their feeds.

####Activity fields

Models are stored in feeds as activities. An activity is composed of at least the following fields: **actor**, **verb**, **object**, **time**. You can also add more custom data if needed.
The Activity mixin will try to set things up automatically:

**object** is a reference to the model instance  
**actor** is a reference to the user attribute of the instance  
**verb** is a string representation of the class name

By default the actor field will look for an attribute called user or actor and a field called created_at to track creation time.
If you're user field is called differently you'll need to tell us where to look for it.
Below shows an example how to set things up if your user field is called author.

```js
var tweetSchema = Schema({
  text    : String,
  user   : { type: Schema.Types.ObjectId, ref: 'User' }
});

tweetSchema.plugin(stream.mongoose.activity);

tweetSchema.methods.activityActorProp = function() {
  return 'actor';
}
```

###Feed manager

This packages comes with a feed_manager class that helps with all common feed operations.  

####Feeds bundled with feed_manager

To get you started the manager has 4 feeds pre configured. You can add more feeds if your application needs it.
The three feeds are divided in three categories.

#####User feed:
The user feed stores all activities for a user. Think of it as your personal Facebook page. You can easily get this feed from the manager.  
```js
FeedManager.getUserFeed(req.user.id);
```  

#####News feeds:
The news feeds store the activities from the people you follow. 
There is both a flat newsfeed (similar to twitter) and an aggregated newsfeed (like facebook).

```js
var flatFeed = FeedManager.getNewsFeeds(foundUser._id)['flat'];
var aggregatedFeed = FeedManager.getNewsFeeds(req.user.id)['aggregated'];
```

#####Notification feed:
The notification feed can be used to build notification functionality. 

<p align="center">
  <img src="http://feedly.readthedocs.org/en/latest/_images/fb_notification_system.png" alt="Notification feed" title="Notification feed"/>
  
Below we show an example of how you can read the notification feed.
```js
var notificationFeed = FeedManager.getNotificationFeed(req.user.id);
```

By default the notification feed will be empty. You can specify which users to notify when your model gets created. In the case of a retweet you probably want to notify the user of the parent tweet.

```js
tweetSchema.methods.activityNotify = function() {
  if (this.isRetweet) {
	  target_feed = FeedManager.getNotificationFeed(this.parent.author.id);
	  return [target_feed];
  }
};
```

Another example would be following a user. You would commonly want to notify the user which is being followed.

```js
followSchema.methods.activityNotify = function() {
  target_feed = FeedManager.getNotificationFeed(this.target._id);
  return [target_feed];
};
```

####Follow a feed
The create the newsfeeds you need to notify the system about follow relationships. The manager comes with APIs to let a user's news feeds follow another user's feed. This code lets the current user's flat and aggregated feeds follow the target_user's personal feed.

```
FeedManager.followUser(userId, targetId);
```

### Showing the newsfeed

####Activity enrichment

When you read data from feeds, a like activity will look like this:

```
{'actor': 'User:1', 'verb': 'like', 'object': 'Like:42'}
```

This is far from ready for usage in your template. We call the process of loading the references from the database enrichment. An example is shown below:

```
router.get('/flat', ensureAuthenticated, function(req, res, next){
    var flatFeed = FeedManager.getNewsFeeds(req.user.id)['flat'];
    
    flatFeed.get({})
    	.then(function (body) {
        	var activities = body.results;
        	return StreamBackend.enrichActivities(activities);
        })
        .then(function (enrichedActivities) {
            return res.render('feed', {location: 'feed', user: req.user, activities: enrichedActivities, path: req.url});
        })
        .catch(next)   
    });
});
```

Promises are used to pipe the asynchronous result of `flatFeed.get` and `StreamBackend.enrichActivities` through our code.

###Temporarily disabling the model sync

Model syncronization can be disabled manually via environment variable.

```js
NODE_ENV=test npm test
```

####Automatically populate paths:

You can automatically populate paths during enrichment via pathsToPopulate static.

```js
tweetSchema.statics.pathsToPopulate = function() {
  return ['link'];
};
```

###Low level APIs access
When needed you can also use the low level JS API directly.
The full explanation can be found in the [getstream.io documentation](https://getstream.io/docs/).
