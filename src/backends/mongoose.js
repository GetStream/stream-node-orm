var baseActivitySchemaPlugin = require('./activity.js');
var util = require("util");
var baseBackend = require('./base');
var mongoose = require('mongoose');
var stream = require('../index.js');

function Backend() {}

function setupMongoose(m) {
  Backend.prototype.getMongoose = function () { return m };
}

util.inherits(Backend, baseBackend);

Backend.prototype.serializeValue = function(value) {
  if (typeof(value._id) != "undefined") {
    return value.constructor.modelName + ':' + value._id;
  } else {
    return value;
  }
}

Backend.prototype.collectReferences = function(activities) {
  var modelReferences = {};
  this.iterActivityFieldsWithReferences(activities, function(args) {

    if (modelReferences[args.modelRef]){
      modelReferences[args.modelRef].push(args.instanceRef);
    } else {
      modelReferences[args.modelRef] = [args.instanceRef];
    }
  });
  return modelReferences;
},

Backend.prototype.loadFromStorage = function(modelClass, objectsIds, callback) {
  var found = {};
  var paths = [];
  if (typeof(modelClass.pathsToPopulate) === 'function') {
    var paths = modelClass.pathsToPopulate();
  }

  // filter out invalid object ids
  var validObjectIds = [];
  objectsIds.forEach(function(objectId) {
      try {
          new mongoose.Types.ObjectId(objectId);
          validObjectIds.push(objectId)
      } catch (e) {
          // skip invalid ids
          return
      }
  });


  modelClass.find({_id: {$in: validObjectIds}}).populate(paths).exec(function(err, docs){
    for (var i in docs){
      found[docs[i]._id] = docs[i];
    }
    callback(err, found);
  });
};

Backend.prototype.getClassFromRef = function(ref) {
  // TODO: raise error if this.getMongoose returns undefined
  // it means user forgot to call setupMongoose
  var mongoose = this.getMongoose();
  var mongooseModel;
  try {
      var mongooseModel = mongoose.model(ref);
  } catch (e) {
      // fail silently
  }
  return mongooseModel;
}

Backend.prototype.getIdFromRef = function(ref) {
  return ref.split(':')[1];
}

function getReferencePaths(paths) {
  var names = [];
  for (var k in paths) {
    if (paths[k].instance === 'ObjectID' && k !== '_id') {
      names.push(paths[k].path);
    }
  }
  return names.join(' ');
}

var mongooseActivitySchemaPlugin = function(schema, options) {
  schema.pre('save', function(next) {
    this.wasNew = this.isNew;
    next();
  });

  schema.post('save', function(doc) {
    var paths = getReferencePaths(doc.schema.paths);
    doc.populate(paths, function(err, docP) {
      if (docP.wasNew) {
        stream.FeedManager.activityCreated(docP);
      }
    });
  });

  schema.post('remove', function(doc) {
    var paths = getReferencePaths(doc.schema.paths);
    doc.populate(paths, function(err, docP) {
      stream.FeedManager.activityDeleted(docP);
    });
  });

  // add Mongoose specific proto functions
  schema.methods.referencesPaths = function() {
    return this;
  };

  schema.methods.getStreamBackend = function() {
    return new Backend();
  };

  schema.statics.activityModelReference = function() {
    return this.modelName;
  };

  schema.methods.activityVerb = function() {
    return this.constructor.modelName;
  };

  schema.statics.pathsToPopulate = function() {
    return [];
  };
};

module.exports.activity = function(schema, options) {
  schema.plugin(baseActivitySchemaPlugin);
  schema.plugin(mongooseActivitySchemaPlugin);
};

module.exports.Backend = Backend;
module.exports.setupMongoose = setupMongoose;
