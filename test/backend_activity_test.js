var Activity = require('../src/backends/activity'),
	expect = require('expect.js');

describe('Activity', function() {
	var activity;
	var schema;

	before(function() {});

	beforeEach(function() {
		schema = { methods: {} };
		activity = Activity(schema, {});
	});

	it('#getStreamBackend', function() {
		expect(function() {
			schema.methods.getStreamBackend();
		}).to.throwError();
	});

	it('#activityActorProp', function() {
		var prop = schema.methods.activityActorProp();

		expect(prop).to.be('user');
	});

	it('#activityVerb', function() {
		var prop = schema.methods.activityVerb();

		expect(prop).to.be('Object');
	});

	it('#activityExtraData', function() {
		var prop = schema.methods.activityExtraData();

		expect(prop).to.eql({});
	});

	it('#activityNotify', function() {
		schema.methods.activityNotify();
	});

	after(function() {});
});
