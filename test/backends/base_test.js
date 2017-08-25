var Backend = require('../../src/backends/base'),
	expect = require('expect.js');

describe('Base Backend', function() {
	var backend;

	beforeEach(function() {
		backend = new Backend();
	});

	describe('#collectReferences', function() {
		it('(1) default', function() {
			var refs = backend.collectReferences([
				{
					actor: 'User:123456',
					object: 'Tweet:00001',
					other: 'something'
				}
			]);

			expect(refs).to.eql({
				User: ['123456'],
				Tweet: ['00001']
			});
		});

		it('(2) origin field', function() {
			var refs = backend.collectReferences([
				{
					actor: 'User:123456',
					object: 'Tweet:00001',
					origin: 'Tweet:00002'
				}
			]);

			expect(refs).to.eql({
				User: ['123456'],
				Tweet: ['00001']
			});
		});

		it('(3) multiple', function() {
			var refs = backend.collectReferences([
				{
					actor: 'User:123456',
					object: 'Tweet:00001',
					other: 'Tweet:00002'
				}
			]);

			expect(refs).to.eql({
				User: ['123456'],
				Tweet: ['00001', '00002']
			});
		});
	});

	it('#serializeActivity', function() {
		expect(backend.serializeActivity).to.be.a(Function);

		var activity = {
			actor: 'User:123456',
			object: 'Tweet:1',
			other: 'matthisk'
		};

		backend.serializeActivity(activity);

		expect(activity).to.eql({
			actor: 'User:123456',
			object: 'Tweet:1',
			other: 'matthisk'
		});
	});

	it('#loadFromStorage', function() {
		expect(backend.loadFromStorage).to.be.a(Function);

		backend.loadFromStorage();
	});

	it('#getClassFromRef', function() {
		expect(backend.getClassFromRef).to.be.a(Function);

		backend.getClassFromRef();
	});

	it('#serializeValue', function() {
		expect(backend.serializeValue).to.be.a(Function);

		var v = backend.serializeValue(1);

		expect(v).to.be(1);
	});
});
