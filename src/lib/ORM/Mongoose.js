// var autoIncrement = require('mongoose-auto-increment');
var util = require('util');
// var FeedManager = require('getstream-node');

var Mongoose = function () {
  this.initialize.apply(this, arguments);
};

Mongoose.prototype = {

  // autoIncrement.initialize(connection);

  initialize: function () {
  },


  registerActivity: function (Model) {

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

          modelName = Model.constructor.modelName;

          instance = {
            userId: doc.user,
            activity: {
              actor: 'user:' + doc.user, 
              verb: modelName,
              object: modelName + ':' + doc.item_id,
              foreign_id: modelName + ':' + doc._id
            }
          };

          FeedManager.activityCreated(instance);
        }
      });

      schema.post('remove', function (doc) {
        FeedManager.activityDeleted(doc);
      });
  }

}

module.exports = Mongoose;