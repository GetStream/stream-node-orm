var stream = require('../GetStreamNode.js');
var BaseActivity = require('../ORM/BaseActivity.js');


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

  stream.FeedManager.registerActivityClass(Model);
}


var activitySchema = function(Schema) {
  // add base proto functions from BaseActivity
  extendSchema(Schema, BaseActivity);

  // add Mongoose specific proto functions
  Schema.methods.activityInstanceReference = function() {
    return this._id;
  }

  Schema.methods.activityVerb = function() {
    return this.constructor.modelName;
  };

  Schema.statics.activityModelReference = function() {
    return 'Mongoose' + this.modelName;
  }

  Schema.statics.loadFromStorage = function(objectsIds, callback) {
    var found = {};
    this.find({_id: {$in: objectsIds}}).exec(function(err, docs){
      for (var i in docs){
        found[docs[i]._id] = docs[i];
      }
      callback(err, found);
    });
  };

};

module.exports.activityModel = activityModel;
module.exports.activitySchema = activitySchema;
