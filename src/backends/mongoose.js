var stream = require('../GetStreamNode.js');
var BaseActivity = require('./activity.js');
var util = require("util");
var mongoose = require('mongoose');

function Backend() {}

util.inherits(Backend, stream.BaseBackend);


Backend.prototype.serializeValue = function(value) {
  if (typeof(value._id) != "undefined") {
    return value.constructor.modelName + ':' + value._id;
  } else {
    return value;
  }
}

Backend.prototype.loadFromStorage = function(modelClass, objectsIds, callback) {
  var found = {};
  var paths = modelClass.pathsToPopulate();
  modelClass.find({_id: {$in: objectsIds}}).populate(paths).exec(function(err, docs){
    for (var i in docs){
      found[docs[i]._id] = docs[i];
    }
    callback(err, found);
  });
};

Backend.prototype.getClassFromRef = function(ref) {
  return mongoose.model(ref);
}

function extendSchema(base, mixin) {
  if (typeof base.methods === 'undefined') {
    base.methods = {};
  }
  if (typeof base.statics === 'undefined') {
    base.statics = {};
  }
  for (var fn in mixin.methods) {
    base.methods[fn] = mixin.methods[fn];
  }
  for (var fn in mixin.statics) {
    base.statics[fn] = mixin.statics[fn];
  }
  return base;
}

var activityModel = function(Model) {
  // plug into mongoose post save and post delete
  Model.schema.pre('save', function(next) {
    this.wasNew = this.isNew;
    next();
  });

  Model.schema.post('save', function(doc) {
    if (doc.wasNew) {
      stream.FeedManager.activityCreated(doc);
    }
  });

  Model.schema.post('remove', function(doc) {
    stream.FeedManager.activityDeleted(doc);
  });
}

var activitySchema = function(Schema) {
  // add base proto functions from BaseActivity
  extendSchema(Schema, BaseActivity);

  // add Mongoose specific proto functions
  Schema.methods.getStreamBackend = function() {
    return new Backend();
  }

  Schema.methods.activityInstanceReference = function() {
    return this._id;
  }

  Schema.statics.activityModelReference = function() {
    return this.modelName;
  }

  Schema.methods.activityVerb = function() {
    return this.constructor.modelName;
  };

  Schema.statics.pathsToPopulate = function() {
    return [];
  };
};

module.exports.activityModel = activityModel;
module.exports.activitySchema = activitySchema;
module.exports.Backend = Backend;
