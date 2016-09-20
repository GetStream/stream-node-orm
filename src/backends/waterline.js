var baseActivitySchemaPlugin = require('./activity.js');
var util = require("util");
var baseBackend = require('./base');

function Backend() {}

/*
* instance.id -> 57e1836a45c973081a8aedfd
* instance.identity -> undefined
* model.identity -> 'passport'
*/

util.inherits(Backend, baseBackend);

Backend.prototype.serializeValue = function(value) {
    throw 'Cant serialize for waterline since model.identity is not accessible from the instance';
  if (typeof(value._id) != "undefined") {
    return value.constructor.modelName + ':' + value.id;
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

Backend.prototype.loadFromStorage = function(modelClass, objectIds, callback) {
  var found = {};
  var paths = [];
  if (typeof(modelClass.pathsToPopulate) === 'function') {
    var paths = modelClass.pathsToPopulate();
  }
  modelClass.find({id: objectIds}).exec(function(err, docs){
    for (var i in docs){
      found[docs[i].id] = docs[i];
    }
    callback(err, found);
    });
};

Backend.prototype.getClassFromRef = function(ref) {
  // takes string user, return User model
  try {
      var modelClass = sails.models[ref];
  } catch (e) {
      // fail silently
  }
  return modelClass;
}

Backend.prototype.getIdFromRef = function(ref) {
  return ref.split(':')[1];
}

function getReferencePaths(paths) {
  var names = [];
  for (var k in paths) {
    if (paths[k].instance === 'ObjectID' && k !== 'id') {
      names.push(paths[k].path);
    }
  }
  return names.join(' ');
}

/*

We could do this using lodash.merge
https://lodash.com/docs/4.16.1#merge
in combination with these lifecycle objects
http://sailsjs.org/documentation/concepts/models-and-orm/lifecycle-callbacks
afterCreate
afterDestroy

Could bind the model.identity so that in case we actually know the identity

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
};*/

module.exports.Backend = Backend;
