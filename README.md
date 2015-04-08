# Stream Node

## Getting started

3. Install getstream-node via `npm install getstream-node` for your application.
4. Copy `getstream.js` from `node_modules/getstream-node` into the root directory of
   your application.
5. Edit `getstream.js` and set your data from your getstream.io account.
6. `require('getstream-node');` on your application.

If you wish to keep the configuration for the module separate from your
application, the module will look for getstream.json in the directory referenced
by the environment variable `STREAM_NODE_CONFIG_DIR` if it's set.



Mongoose backend
----------------


Models created with connect.model are not supported by this integration

```js
connection.model()
```

```
var tweetSchema = Schema({
  text    : String,
  actor   : { type: Schema.Types.ObjectId, ref: 'User' },
  bg      : String,
  link    : { type: Schema.Types.ObjectId, ref: 'Link' }
});

StreamMongoose.activitySchema(tweetSchema);

tweetSchema.statics.pathsToPopulate = function() {
  return ['actor', 'link'];
};

tweetSchema.methods.activityExtraData = function() {
  return {'bg': this.bg, 'link': this.link};
}

tweetSchema.methods.activityActorProp = function() {
  return 'actor';
}
```
