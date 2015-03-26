var async = require("async");
var stream = require('./GetStreamNode.js');

var Enricher = function(fields, options) {
  this.setFields(fields);
}

Enricher.prototype = {
  setFields: function(fields) {
    this.fields = fields || ['actor', 'object'];
  },
  isReference: function(value) {
    return (typeof(value) !== 'undefined' && value.indexOf(':') !== -1 && value.split(':').length) == 2;
  },
  getClassFromRef: function(ref) {
    return stream.FeedManager.getActivityClass(ref);
  },
  collectReferences: function(activities) {
    var modelReferences = {};
    for (var i in activities) {
      var activity = activities[i];
      for (var i in this.fields) {
        var field = this.fields[i];
        if(!this.isReference(activity[field])) continue;
        var modelRef = activity[field].split(":")[0];
        var instanceRef = activity[field].split(":")[1];
        if (modelReferences[modelRef]){
          modelReferences[modelRef].push(instanceRef);
        } else {
          modelReferences[modelRef] = [instanceRef];
        }
      }
    }
    return modelReferences;
  },
  retreiveObjects: function (references, callback) {
    var objects = {};
    var self = this;
    async.each(Object.keys(references),
      function(modelRef, done){
        var refs = references[modelRef];
        var modelClass = self.getClassFromRef(modelRef);
        if (typeof(objects[modelRef]) === 'undefined') objects[modelRef] = {};
        modelClass.loadFromStorage(refs, function(err, objectsIds) {
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
    if (activities.length == 0) {
      return activities;
    }
    var references = this.collectReferences(activities);
    this.retreiveObjects(references, function(err, objects) {
      for (var i in activities) {
        var activity = activities[i];
        for (var j in self.fields) {
          var field = self.fields[j];
          if(!self.isReference(activity[field])) continue;
          var modelRef = activity[field].split(":")[0];
          var instanceRef = activity[field].split(":")[1];
          if (objects[modelRef] && objects[modelRef][instanceRef]){
            activities[i][field] = objects[modelRef][instanceRef];
          }
        }
      }
      callback(err, activities);
    });
  },
  enrichAggregatedActivities: function(aggregatedActivities, callback) {
    if (activities.length == 0) {
      return activities;
    }
    for (key in aggregatedActivities) {
      aggregatedActivities[key]['activities'] = this.collectReferences(aggregatedActivities[key]['activities']);
    }
    return activities;
  }
}

module.exports = Enricher;
