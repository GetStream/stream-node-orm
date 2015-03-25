var utils = require('../utils.js');
var stream = require('../GetStreamNode.js');
var BaseActivity = require('../ORM/BaseActivity.js');


var ActivityModel = function(Model) {
  // add base proto functions from BaseActivity
  utils.extend(Model, BaseActivity);

  // add Mongoose specific proto functions
  Model.prototype.activity_instance_reference = function() {
    return this._id;
  }

  Model.prototype.activity_model_reference = function() {
    return 'Mongoose' + Model.modelName;
  }

  Model.prototype.activity_verb = function() {
    return Model.modelName;
  };

  Model.prototype.fromDb = function(objectsIds) {
    var found = [];
    Model.find({_id: {$in: objectsIds}}).populate(['user']).exec(function(err, objects) {
      if (err) console.log(err);
      found = objects;
    });
    return found;
  };

  stream.FeedManager.registerActivityModel(new Model());

  // plug into mongoose post save and post delete
  Model.schema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
  });

  Model.schema.post('save', function (doc) {
    if (this.wasNew) {
      stream.FeedManager.activityCreated(doc.create_activity());
    }
  });

  Model.schema.post('remove', function (doc) {
    stream.FeedManager.activityDeleted(doc);
  });
};

module.exports.ActivityModel = ActivityModel;
