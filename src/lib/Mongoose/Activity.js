var autoIncrement = require('mongoose-auto-increment');

function ActivitySchema(connection, Schema) {

  autoIncrement.initialize(connection);

  function Activity () {           
      Schema.apply(this, arguments);

      this.plugin(autoIncrement.plugin, {model: this.options.collection, field: '_id'});

      this.methods.foreign_id = function () {
        return this._id;
      }

      this.pre('save', function (doc) {
        this.wasNew = this.isNew;
        next();
      });

      this.post('save', function (doc) {
        if (this.wasNew) {

        }
      });

      this.post('remove', function (doc) {
        console.log('%s has been removed', doc._id);
      });
  };
                                              
  util.inherits(Activity, Schema);

  return Activity;
}

module.exports = ActivitySchema;