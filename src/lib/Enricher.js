var _ = require('underscore');

var Enricher = function () {
  this.initialize.apply(this, arguments);
};

Enricher.prototype = {

    initialize: function(fields) {
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

pinSchema.statics.enrich_activities = function(pin_activities, cb){
  if (typeof pin_activities === 'undefined')
    return cb(null, []);

    pinIds = _.map(_.pluck(pin_activities, 'foreign_id'), function(foreign_id){
      return parseInt(foreign_id.split(':')[1]);
    });

  Pin.find({_id: {$in: pinIds}}).populate(['user', 'item']).exec(function(err, found){
    User.populate(found, {path: 'item.user'}, function(err, done){
      if (err)
        return next(err);
      else
        cb(err, done);
    });
  });
};

followSchema.statics.enrich_activities = function(follow_activities, cb){
  if (typeof follow_activities === 'undefined')
    return cb(null, []);

  followIds = _.map(_.pluck(follow_activities, 'foreign_id'), function(foreign_id){
    return parseInt(foreign_id.split(':')[1]);
  });

  Follow.find({_id: {$in: followIds}}).populate(['user', 'target']).exec(cb);
};