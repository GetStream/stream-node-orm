var Enricher = function (obj) {
  if (obj) return mixin(obj);
};

function mixin(obj) {
  for (var key in Enricher.prototype) {
    obj.prototype[key] = Enricher.prototype[key];
  }
}

Enricher.prototype = {

    setFields: function(fields) {
        this.fields = fields || ['actor', 'object'];
    },


    collectReferences: function(activities) {
        var modelReferences = [];

        for (key in activities) {

            activity = activities[key];

            for (field in activity) {
                activities[key]['references'] = [];

                if (this.fields.indexOf(activity[field]) >= 0) {
                    reference = activity[field].split(":");
                    activities[key]['references'][reference[0]][reference[1]] = 1;
                }
            }
        }

        return activities;
    },


    retreiveObjects: function (activities) {
        for (key in activities) {
          activity = activities[key];

          for (model in activity['references']) {
            objectIds = activity['references'][model];

            activites[key]['objects'][model] = this.fromDB(objectsIds);
          }
        }
    },


    enrichActivities: function(activities) {
        if (activities.length == 0) {
            return activities;
        }

        activities = this.collectReferences(activities);

        return activities;
    },


    enrichAggregatedActivities: function(aggregatedActivities) {
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
