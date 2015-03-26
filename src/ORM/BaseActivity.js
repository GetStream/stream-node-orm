var BaseActivity = function() {
};

BaseActivity.methods = {};
BaseActivity.statics = {};

// Common proto functions
BaseActivity.methods.activity_actor = function() {
    var actor = this[this.activity_actor_prop()];
    return this.activity_create_reference(actor);
};

BaseActivity.methods.activity_object = function() {
    return this.activity_create_reference(this);
};

BaseActivity.methods.activity_foreign_id = function() {
    return this.activity_create_reference(this);
};

BaseActivity.methods.create_activity = function() {
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

BaseActivity.methods.activity_create_reference = function() {
  return this.constructor.activity_model_reference() + ':' + this.activity_instance_reference();
};

// Backend specific proto functions
BaseActivity.methods.activity_instance_reference = function() {}

BaseActivity.statics.activity_model_reference = function() {}
BaseActivity.statics.loadFromStorage = function(objectsIds, callback) {};

// User specific proto functions (with decent defaults)
BaseActivity.methods.activity_actor_prop = function() {
    return 'user'
};

BaseActivity.methods.activity_verb = function() {
    return this.constructor.name;
};

BaseActivity.methods.activity_extra_data = function() {
    return {};
};

BaseActivity.methods.activity_time = function() {};

BaseActivity.methods.activity_notify = function() {};

module.exports = BaseActivity;
