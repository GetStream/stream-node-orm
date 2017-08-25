var Promise = require('promise');

/**
 * Use this monkey patch to enable promises on
 * mongoose methods
 */
Function.prototype.promisify = function(ctx) {
	var args = Array.prototype.slice.call(arguments, 1);

	var fn = Promise.denodeify(this);
	return fn.apply(ctx, args);
};
