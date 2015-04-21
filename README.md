# Stream Node

[![Build Status](https://travis-ci.org/tbarbugli/stream-node.svg)](https://travis-ci.org/tbarbugli/stream-node)


## Install

. Install getstream-node via `npm install getstream-node` for your application
. Copy `getstream.js` config file from `node_modules/getstream-node` into the root directory of
   your application
. Edit `getstream.js` and set your API keys (https://getstream.io/dashboard)
. Add `require('getstream-node');` early on in your application code

If you wish to keep the configuration for the module separate from your
application, the module will look for getstream.json in the directory referenced
by the environment variable `STREAM_NODE_CONFIG_DIR` if it's set.


Mongoose integration
--------------------

Note: Models created with connect.model are not supported by this integration

```js
connection.model()
```

Register the models' schemas that you want to store in feeds:

```js
var stream = require('getstream-node');

var tweetSchema = Schema({
  text    : String,
  actor   : { type: Schema.Types.ObjectId, ref: 'User' },
  bg      : String,
  link    : { type: Schema.Types.ObjectId, ref: 'Link' }
});

stream.mongoose.activitySchema(tweetSchema);
```

Store extra information in feeds:

```js
tweetSchema.methods.activityExtraData = function() {
  return {'bg': this.bg, 'link': this.link};
}
```

Automatically populate paths:

```js
tweetSchema.statics.pathsToPopulate = function() {
  return ['actor', 'link'];
};

Use custom attribute for the actor field:

```js
tweetSchema.methods.activityActorProp = function() {
  return 'actor';
}
```
