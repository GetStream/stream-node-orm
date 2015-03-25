var util = require('util');
var FeedManager = require('../FeedManager.js');


var ActivityModel = function(Model) {
    // add base proto functions from BaseActivity
    extend(Model, BaseActivity);

    // add Mongoose specific proto functions
    Model.prototype.activity_create_reference = function() {
      return this._id; 
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

    // plug into mongoose post save and post delete
    Model.schema.pre('save', function (next) {
      this.wasNew = this.isNew;
      next();
    });

    Model.schema.post('save', function (doc) {
      if (this.wasNew) {
        FeedManager.activityCreated(doc.create_activity());
      }
    });

    Model.schema.post('remove', function (doc) {
      FeedManager.activityDeleted(doc);
    });
  };

  module.exports.ActivityModel = ActivityModel;
