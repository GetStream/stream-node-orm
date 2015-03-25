var BaseActivity = function() {
};

// Common proto functions
BaseActivity.prototype.activity_actor = function() {
    var actor = this[this.activity_actor_prop()];
    return this.activity_create_reference(actor);
};

BaseActivity.prototype.activity_object = function() {
    return this.activity_create_reference(this);
};

BaseActivity.prototype.activity_foreign_id = function() {
    return this.activity_create_reference(this);
};

BaseActivity.prototype.create_activity = function() {
    var activity = {};
    var extra_data = this.activity_extra_data();
    for (var key in extra_data) {
        activity[key] = extra_data[key];
    }
    var to = this.activity_notify();
    if (to) {
        activity.to = to.map(function(x){return x.id});
    }
    activity.actor = this.activity_actor();
    activity.verb = this.activity_verb();
    activity.object = this.activity_object();
    activity.foreign_id = this.activity_foreign_id();
    activity.time = this.activity_time();
    return activity;
}

// Backend specific proto functions
BaseActivity.prototype.activity_create_reference = function() {
    // TODO: throw a not configured expection
};

BaseActivity.prototype.fromDb = function(objectsIds) {};

// User specific proto functions (with decent defaults)
BaseActivity.prototype.activity_actor_prop = function() {
    return 'user'
};

BaseActivity.prototype.activity_verb = function() {
    return this.constructor.name;
};

BaseActivity.prototype.activity_extra_data = function() {
    return {};
};

BaseActivity.prototype.activity_time = function() {};

BaseActivity.prototype.activity_notify = function() {};

