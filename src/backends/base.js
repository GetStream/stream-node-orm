var async = require("async");

var BaseBackend = function() {
}

BaseBackend.prototype = {
  isReference: function(value) {
    return (typeof(value) === 'string' && value.split(':').length == 2);
  },
  iterActivityFields: function(activities, filter, fn) {
    for (var i in activities) {
      var activity = activities[i];
      for (var field in activity) {
        if(!filter(activity[field])) continue;
        var args = {
          'activity': activity,
          'field': field
        };
        fn(args);
      }
    }
  },
  iterActivityFieldsWithObjects: function(activities, fn) {
    this.iterActivityFields(activities, function(value){ return (typeof(value) === 'object');}, fn);
  },
  iterActivityFieldsWithReferences: function(activities, fn) {
    var self = this;
    this.iterActivityFields(activities, this.isReference, function(args) {
      var field = args['field'];
      args['modelRef'] = args['activity'][field].split(":")[0];
      args['instanceRef'] = args['activity'][field].split(":")[1];
      fn(args);
    });
  },
  collectReferences: function(activities) {
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
  retreiveObjects: function (references, callback) {
    var objects = {};
    var self = this;
    async.each(Object.keys(references),
      function(modelRef, done){
        var refs = references[modelRef];
        var modelClass = self.getClassFromRef(modelRef);
        if (typeof(modelClass) === 'undefined') return done();
        if (typeof(objects[modelRef]) === 'undefined') objects[modelRef] = {};
        self.loadFromStorage(modelClass, refs, function(err, objectsIds) {
          for(var k in objectsIds){
            objects[modelRef][k] = objectsIds[k];
          }
          done(err);
        });
      },
      function(err){
        callback(err, objects);
      }
    );
  },
  enrichActivities: function(activities, callback) {
    var self = this;
    var references = this.collectReferences(activities);
    this.retreiveObjects(references, function(err, objects) {
      self.iterActivityFieldsWithReferences(activities, function(args) {
        if (objects[args.modelRef] && objects[args.modelRef][args.instanceRef]){
          args.activity[args.field] = objects[args.modelRef][args.instanceRef];
        }
      });
      callback(err, activities);
    });
  },
  enrichAggregatedActivities: function(aggregatedActivities, callback) {
    var references = {};
    var enrichments = [];
    var self = this;
    for (var i in aggregatedActivities) {
      var aggregated = aggregatedActivities[i];
      enrichments.push(function(done){
        self.enrichActivities(aggregated['activities'], done);
      });
    }
    async.parallel(enrichments, function(err){callback(err, aggregatedActivities)});
  },
  serializeActivities: function(activities){
    var self = this;
    this.iterActivityFieldsWithObjects(activities, function(args) {
      var value = args.activity[args.field];
      args.activity[args.field] = self.serializeValue(value);
    });
  },
  // Backend specific functions
  loadFromStorage: function(objectsIds, callback) {},
  serializeValue: function(value) {
    return value;
  },
  getClassFromRef: function(ref) {},
}

module.exports = BaseBackend;