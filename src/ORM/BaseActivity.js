var BaseActivity = function() {
};

BaseActivity.methods = {};
BaseActivity.statics = {};

// Common proto functions
BaseActivity.methods.activityActorFeed = function() {};

BaseActivity.methods.activityGetActor = function() {
    var actor = this[this.activityActorProp()];
    if (typeof(actor) === 'undefined'){
        // todo: throw a clear error here
    }
    return actor;
};

BaseActivity.methods.activityActor = function() {
    var actor = this.activityGetActor();
    if (typeof(actor.activityInstanceReference) === 'function') {
        return actor.activityCreateReference(actor);
    } else {
        return actor;
    }
};

BaseActivity.methods.activityActorId = function() {
    var actor = this.activityGetActor();
    if (typeof(actor.activityInstanceReference) === 'function') {
        return actor.activityInstanceReference(actor);
    } else {
        return actor;
    }
};

BaseActivity.methods.activityObject = function() {
    return this.activityCreateReference(this);
};

BaseActivity.methods.activityForeignId = function() {
    return this.activityCreateReference(this);
};

BaseActivity.methods.createActivity = function() {
    var activity = {};
    var extra_data = this.activityExtraData();
    for (var key in extra_data) {
        activity[key] = extra_data[key];
    }
    activity.to = (this.activityNotify() || []).map(function(x){return x.id});
    activity.actor = this.activityActor();
    activity.verb = this.activityVerb();
    activity.object = this.activityObject();
    activity.foreign_id = this.activityForeignId();
    if (this.activityTime()) {
        activity.time = this.activityTime();
    }
    return activity;
}

BaseActivity.methods.activityCreateReference = function() {
  return this.constructor.activityModelReference() + ':' + this.activityInstanceReference();
};

// Backend specific proto functions
BaseActivity.methods.activityInstanceReference = function() {}

BaseActivity.statics.activityModelReference = function() {}
BaseActivity.statics.loadFromStorage = function(objectsIds, callback) {};

// User specific proto functions (with decent defaults)
BaseActivity.methods.activityActorProp = function() {
    return 'user'
};

BaseActivity.methods.activityVerb = function() {
    return this.constructor.name;
};

BaseActivity.methods.activityExtraData = function() {
    return {};
};

BaseActivity.methods.activityTime = function() {};

BaseActivity.methods.activityNotify = function() {};

module.exports = BaseActivity;
