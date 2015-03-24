var util = require('util');
var stream_node = require('getstream-node');
var EnricherBase = require('./EnricherBase');

var ActivityModel = function (Model) {
    // console.log(Model);

    var modelName = Model.modelName;
    // console.log(modelName);

    var FeedManager = stream_node.FeedManager;

    schema = Model.schema;

    Model.prototype.foreign_id = function() {
        return this._id; 
    }

    schema.pre('save', function (next) {
      this.wasNew = this.isNew;
      next();
    });

    schema.post('save', function (doc) {

      if (this.wasNew) {

        instance = {
          userId: doc.user,
          activity: {
            actor: 'user:' + doc.user, 
            verb: modelName,
            object: modelName + ':' + doc._id,
            foreign_id: modelName + ':' + doc._id
          }
        };

        FeedManager.activityCreated(instance);
      }
    });

    schema.post('remove', function (doc) {
      FeedManager.activityDeleted({
        foreign_id: modelName + ':' + doc._id,
        actor: doc.user
      });
    });

    var Enricher = EnricherBase;

    Enricher.prototype.fromDb = function (objectsIds) {
      var found = [];

      Model.find({_id: {$in: objectsIds}}).populate(['user']).exec(function(err, objects) {
        if (err) console.log(err);
        found = objects;
      });

      return found;
    };
};

module.exports.ActivityModel = ActivityModel;

