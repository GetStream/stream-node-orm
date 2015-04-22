var BaseActivity = require('./activity.js');
var util = require("util");
var stream = require('../index.js');

function Backend() {}

function setupMongoose(m) {
  Backend.prototype.getMongoose = function () { return m };
}

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
  var paths = [];
  if (typeof(modelClass.pathsToPopulate) === 'function') {
    var paths = modelClass.pathsToPopulate();
  }
  modelClass.find({_id: {$in: objectsIds}}).populate(paths).exec(function(err, docs){
    for (var i in docs){
      found[docs[i]._id] = docs[i];
    }
    callback(err, found);
  });
};

Backend.prototype.getClassFromRef = function(ref) {
  var mongoose = this.getMongoose();
  return mongoose.model(ref);
}

Backend.prototype.getIdFromRef = function(ref) {
  return ref.split(':')[1];
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

var activitySchema = function(Schema) {
  // add base proto functions from BaseActivity
  extendSchema(Schema, BaseActivity);

  Schema.pre('save', function(next) {
    this.wasNew = this.isNew;
    next();
  });

  Schema.post('save', function(doc) {
    if (doc.wasNew) {
      stream.FeedManager.activityCreated(doc);
    }
  });

  Schema.post('remove', function(doc) {
    stream.FeedManager.activityDeleted(doc);
  });

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

module.exports.activitySchema = activitySchema;
module.exports.Backend = Backend;
module.exports.setupMongoose = setupMongoose;
