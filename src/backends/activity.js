module.exports = function (schema, options) {
  // Common proto functions
  schema.methods.activityActorFeed = function() {
      return null;
  };

  schema.methods.activityGetActor = function() {
      var actor = this[this.activityActorProp()];
      if (typeof(actor) === 'undefined'){
          // todo: throw a clear error here
      }
      return actor;
  };

  schema.methods.activityActor = function() {
      var actor = this.activityGetActor();
      return actor;
  };

  schema.methods.activityObject = function() {
      return this;
  };

  schema.methods.activityForeignId = function() {
      return this;
  };

  schema.methods.createActivity = function() {
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

  // User specific proto functions (with decent defaults)
  schema.methods.getStreamBackend = function() {
      var stream = require('../index.js');
      return new stream.BaseBackend();
  };

  schema.methods.activityActorProp = function() {
      return 'user'
  };

  schema.methods.activityVerb = function() {
      return this.constructor.name;
  };

  schema.methods.activityExtraData = function() {
      return {};
  };

  schema.methods.activityTime = function() {};

  schema.methods.activityNotify = function() {};

};
