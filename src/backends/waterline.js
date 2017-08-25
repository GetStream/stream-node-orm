var baseActivitySchemaPlugin = require('./activity.js');
var util = require('util');
var baseBackend = require('./base');

function Backend() {}

/*
* instance.id -> 57e1836a45c973081a8aedfd
* instance.identity -> undefined
* model.identity -> 'passport'
*/

util.inherits(Backend, baseBackend);

Backend.prototype.serializeValue = function(value) {
	throw new Error('Cant serialize for waterline since model.identity is not accessible from the instance');
};

(Backend.prototype.collectReferences = function(activities) {
	var modelReferences = {};
	this.iterActivityFieldsWithReferences(activities, function(args) {
		if (modelReferences[args.modelRef]) {
			modelReferences[args.modelRef].push(args.instanceRef);
		} else {
			modelReferences[args.modelRef] = [args.instanceRef];
		}
	});

	return modelReferences;
}), (Backend.prototype.loadFromStorage = function(modelClass, objectIds, callback) {
	var found = {};
	var paths = [];
	if (typeof modelClass.pathsToPopulate === 'function') {
		var paths = modelClass.pathsToPopulate();
	}

	modelClass.find({ id: objectIds }).exec(function(err, docs) {
		for (var i in docs) {
			found[docs[i].id] = docs[i];
		}

		callback(err, found);
	});
});

Backend.prototype.getClassFromRef = function(ref) {
	// takes string user, return User model
	try {
		var modelClass = sails.models[ref];
	} catch (e) {
		// fail silently
	}

	return modelClass;
};

Backend.prototype.getIdFromRef = function(ref) {
	return ref.split(':')[1];
};

module.exports.Backend = Backend;
