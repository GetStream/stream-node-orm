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
  stream.FeedManager.registeractivity(Model);

  // plug into mongoose post save and post delete
  Model.schema.pre('save', function(next) {
    this.wasNew = this.isNew;
    next();
  });

  Model.schema.post('save', function(doc) {
    if (this.wasNew) {
      stream.FeedManager.activityCreated(doc.create_activity());
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
  Schema.methods.activity_instance_reference = function() {
    return this._id;
  }

  Schema.methods.activity_verb = function() {
    return this.constructor.modelName;
  };

  Schema.statics.activity_model_reference = function() {
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
