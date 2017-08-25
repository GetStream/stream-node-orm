## Stream Node.js

[![Build Status](https://travis-ci.org/tbarbugli/stream-node.svg)](https://travis-ci.org/tbarbugli/stream-node)
[![npm version](https://badge.fury.io/js/getstream-node.svg)](http://badge.fury.io/js/getstream-node)
[![Coverage Status](https://coveralls.io/repos/github/GetStream/stream-node-orm/badge.svg?branch=refactor-tests)](https://coveralls.io/github/GetStream/stream-node-orm?branch=refactor-tests)

[![NPM](https://nodei.co/npm/getstream-node.png)](https://nodei.co/npm/getstream-node/)

[stream-node-orm](https://github.com/GetStream/stream-node-orm) is a Node.js (Sails, Waterline) client for [Stream](https://getstream.io/).

You can sign up for a Stream account at https://getstream.io/get_started.

Note there is also a lower level [Node.js - Stream integration](https://github.com/getstream/stream-js) library which is suitable for all JavaScript applications.

### Build activity streams & news feeds

<p align="center">
  <img src="https://dvqg2dogggmn6.cloudfront.net/images/mood-home.png" alt="Examples of what you can build" title="What you can build"/>
</p>

You can build:

* Activity streams such as those seen on Github
* A Twitter style newsfeed
* A feed like Instagram or Pinterest
* Facebook style newsfeeds
* A notification system

### Supported ORMs

Stream node currently supports:

* Mongoose (full support, both serialization and enrichment)
* Waterline (partial support, enrichment only)

### Demo

You can check out our example app on Github [https://github.com/GetStream/Stream-Example-Nodejs](https://github.com/GetStream/Stream-Example-Nodejs)

###Installation

#### Step 1 - NPM

Install getstream_node package with npm:

```npm install getstream-node --save```

#### Step 2 - Config file

Copy `getstream.js` config file from `node_modules/getstream-node` into the root directory of your application
Make sure you require the getstream-node early on in your application (eg. in app.js)

#### Step 3 - Get your API key

Login with Github on [getstream.io](https://getstream.io/) and edit the configuration values for
```apiKey```, ```apiSecret``` and ```apiAppId``` in your `getstream.js` file (you can find them in the [dashboard](https://getstream.io/dashboard/)).

###Model integration

Stream Node.js can automatically publish new activities to your feeds. To do that you only need to register the models you want to publish with this library.

```js
var stream = require('getstream-node');

var tweetSchema = Schema({
  text    : String,
  user   : { type: Schema.Types.ObjectId, ref: 'User' }
});

tweetSchema.plugin(stream.mongoose.activity);

// register your mongoose connection with the library
stream.mongoose.setupMongoose(mongoose);
```

Every time a Tweet is created it will be added to the user's feed. Users which follow the given user will also automatically get the new tweet in their feeds.

####Activity fields

Models are stored in feeds as activities. An activity is composed of at least the following fields: **actor**, **verb**, **object**, **time**. You can also add more custom data if needed.
The Activity mixin will try to set things up automatically:

**object** is a reference to the model instance
**actor** is a reference to the user attribute of the instance
**verb** is a string representation of the class name

By default the actor field will look for an attribute called user or actor and a field called created_at to track creation time.
If your user field is called differently you'll need to tell us where to look for it.
Below shows an example how to set things up if your user field is called author.

```js
var tweetSchema = Schema({
  text    : String,
  author   : { type: Schema.Types.ObjectId, ref: 'User' }
});

tweetSchema.plugin(stream.mongoose.activity);

tweetSchema.methods.activityActorProp = function() {
  return 'author';
}
```

#### Customizing the activity

Sometimes you'll want full control over the activity that's send to getstream.io.
To do that you can overwrite the default createActivity method on the model

```js
tweetSchema.methods.createActivity = function() {
	// this is the default createActivity code, customize as you see fit.
      var activity = {};
      var extra_data = this.activityExtraData();
      for (var key in extra_data) {
          activity[key] = extra_data[key];
      }
      activity.to = (this.activityNotify() || []).map(function(x){return x.id});
      activity.actor = this.activityActor();
      activity.verb = this.activityVerb();
      activity.object = this.activityObject();
      activity.foreign_id = this.activityForeignId();
      if (this.activityTime()) {
          activity.time = this.activityTime();
      }
      return activity;
  }
```

###Feed manager

This packages comes with a feed_manager class that helps with all common feed operations.

####Feeds bundled with feed_manager

To get you started the manager has 4 feeds pre-configured. You can add more feeds if your application needs it.
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
var flatFeed = FeedManager.getNewsFeeds(foundUser._id)['timeline_flat'];
var aggregatedFeed = FeedManager.getNewsFeeds(req.user.id)['timeline_aggregated'];
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
To follow the created newsfeeds you need to notify the system about follow relationships. The manager comes with APIs to let a user's news feeds follow another user's feed. This code lets the current user's flat and aggregated feeds follow the target_user's personal feed.

```
FeedManager.followUser(userId, targetId);
```

### Showing the newsfeed

####Activity enrichment

When you read data from feeds, a like activity will look like this:

```js
{'actor': 'User:1', 'verb': 'like', 'object': 'Like:42'}
```

This is far from ready for usage in your template. We call the process of loading the references from the database enrichment. An example is shown below:

```js
router.get('/flat', ensureAuthenticated, function(req, res, next){
    var flatFeed = FeedManager.getNewsFeeds(req.user.id)['timeline_flat'];

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

Model synchronization can be disabled manually via environment variable.

```js
NODE_ENV=test npm test
```

####Automatically populate paths:

You can automatically populate paths during enrichment via the pathsToPopulate static.

```js
tweetSchema.statics.pathsToPopulate = function() {
  return ['link'];
};
```

### Full documentation and Low level APIs access

When needed you can also use the [low level JavaScript API](https://github.com/getstream/stream-js) directly. Documentation is available at the [Stream website](https://getstream.io/docs/?language=js).

```js
var streamNode = require('getstream-node');
var client = streamNode.FeedManager.client
// client.addActivity, client.removeActivity etc are all available
```

### Enrichment

You can use the enrichment capabilities of this library directly.

```js
var streamNode = require('getstream-node');
var streamMongoose = new streamNode.MongooseBackend()
// or
var streamWaterline = new streamNode.WaterlineBackend()
// now enrich the activities
streamWaterline.enrichActivities(activities).then(function(enrichedActivities) {
	res.json({'results': enrichedActivities})
}).catch(function(err) {
	sails.log.error('enrichment failed', err)
	return res.serverError('failed to load articles in the feed')
})
```

### Customizing enrichment (since 1.4.0)

By default the enrichment system assumes that you're referencing items by their id. Sometimes you'll want to customize this behaviour. You might for instance use a username instead of an id. Alternatively you might mant to use a caching layer instead of the ORM for loading the data. The example below shows how to customize the lookup for all User entries.

```js
// subclass streamMongoose
function streamCustomEnrichment() {};
streamCustomEnrichment.prototype = {
    loadUserFromStorage: function(modelClass, objectsIds, callback) {
        var found = {};
        var paths = [];
        if (typeof(modelClass.pathsToPopulate) === 'function') {
            var paths = modelClass.pathsToPopulate();
        }
	// Here's the magic, use a username instead of id
        modelClass.find({
            username: {
                $in: objectsIds
            }
        }).populate(paths).exec(function(err, docs) {
            for (var i in docs) {
                found[docs[i]._id] = docs[i];
            }
            callback(err, found);
        });
    }
}
util.inherits(streamCustomEnrichment, streamNode.mongoose.Backend);
```

### Contributing

Running tests:

```
npm test
```

### Releasing

Make sure your working directory is clean and run:

```
npm install
npm version [ major | minor | patch ]
npm publish
```
=======
### Copyright and License Information

Copyright (c) 2015-2017 Stream.io Inc, and individual contributors. All rights reserved.

See the file "LICENSE" for information on the history of this software, terms & conditions for usage, and a DISCLAIMER OF ALL WARRANTIES.
