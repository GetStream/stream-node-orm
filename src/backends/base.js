var async = require('async');
var Promise = require('promise');

var BaseBackend = function() {};

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

BaseBackend.prototype = {
	isReference: function(field, value) {
		if (field === 'origin' || field === 'foreign_id') {
			return false;
		}

		return typeof value === 'string' && value.split(':').length == 2;
	},

	iterActivityFields: function(activities, filter, fn) {
		for (var i in activities) {
			var activity = activities[i];
			for (var field in activity) {
				if (!filter(field, activity[field])) continue;
				var args = {
					activity: activity,
					field: field
				};
				fn(args);
			}
		}
	},

	iterActivityFieldsWithObjects: function(activities, fn) {
		this.iterActivityFields(activities, function(field, value) {
				return value !== null && typeof value === 'object';
		}, fn);
	},

	iterActivityFieldsWithReferences: function(activities, fn) {
		this.iterActivityFields(activities, this.isReference, function(args) {
			var field = args['field'];
			args['modelRef'] = args['activity'][field].split(':')[0];
			args['instanceRef'] = args['activity'][field].split(':')[1];
			fn(args);
		});
	},

	collectReferences: function(activities) {
		var modelReferences = {};
		this.iterActivityFieldsWithReferences(activities, function(args) {
			if (modelReferences[args.modelRef]) {
				modelReferences[args.modelRef].push(args.instanceRef);
			} else {
				modelReferences[args.modelRef] = [args.instanceRef];
			}
		});

		return modelReferences;
	},

	retreiveObjects: function(references, callback) {
		var objects = {};
		var self = this;
		async.each(
			Object.keys(references),
			function(modelRef, done) {
				var refs = references[modelRef];
				var modelClass = self.getClassFromRef(modelRef);
				if (typeof modelClass === 'undefined') return done();
				if (typeof objects[modelRef] === 'undefined')
					objects[modelRef] = {};
				self.loadFromStorageOrCustom(modelRef, modelClass, refs, function(err, objectsIds) {
						for (var k in objectsIds) {
							objects[modelRef][k] = objectsIds[k];
						}
						done(err);
				});
			},
			function(err) {
				callback(err, objects);
			}
		);
	},

	enrichActivities: function(activities) {
		// Return a Promise instead of using node style callbacks (_enrichActivities accepts one argument + callback)
		return Promise.denodeify(this._enrichActivities, 1).call(this, activities);
	},

	_enrichActivities: function(activities, callback) {
		var self = this;
		var references = this.collectReferences(activities);
		this.retreiveObjects(references, function(err, objects) {
			self.iterActivityFieldsWithReferences(activities, function(args) {
				if (
					objects[args.modelRef] &&
					objects[args.modelRef][args.instanceRef] &&
					args.field !== 'foreign_id'
				) {
					args.activity[args.field] =
						objects[args.modelRef][args.instanceRef];
				}
			});

			callback(err, activities);
		});
	},

	enrichAggregatedActivities: function(aggregatedActivities) {
		// Return a Promise instead of using node style callbacks (_enrichAggregatedActivities accepts one argument + callback)
		return Promise.denodeify(this._enrichAggregatedActivities, 1).call(this, aggregatedActivities);
	},

	_enrichAggregatedActivities: function(aggregatedActivities, callback) {
		var references = {};
		var enrichments = [];
		var self = this;
		for (var i in aggregatedActivities) {
			enrichments.push(
				(function(aggregated) {
					return function(done) {
						self
							.enrichActivities(aggregated['activities'])
							.then(done.bind(this, null), done);
					};
				})(aggregatedActivities[i])
			);
		}

		async.parallel(enrichments, function(err) {
			callback(err, aggregatedActivities);
		});
	},

	serializeActivities: function(activities) {
		var self = this;
		this.iterActivityFieldsWithObjects(activities, function(args) {
			var value = args.activity[args.field];
			args.activity[args.field] = self.serializeValue(value);
		});
	},

	serializeActivity: function(activity) {
		this.serializeActivities([activity]);
	},

	loadFromStorageOrCustom: function(modelRef, modelClass, refs, callback) {
		var ref = capitalizeFirstLetter(modelRef.toLowerCase());
		var customLoader = 'load' + ref + 'FromStorage';
		if (this[customLoader]) {
			return this[customLoader](modelClass, refs, callback);
		} else {
			return this.loadFromStorage(modelClass, refs, callback);
		}
	},
	// Backend specific functions
	loadFromStorage: function(modelClass, refs, callback) {},

	serializeValue: function(value) {
		return value;
	},

	getClassFromRef: function(ref) {},
};

module.exports = BaseBackend;
