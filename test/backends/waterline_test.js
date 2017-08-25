var Backend = require('../../src/backends/waterline').Backend,
	sinon = require('sinon'),
	extend = require('util')._extend,
	expect = require('expect.js');

describe('Waterline Backend', function() {
	var backend;

	beforeEach(function() {
		backend = new Backend();
	});

	it('#serializeValue', function() {
		expect(function() {
			backend.serializeValue('value');
		}).to.throwException();
	});

	describe('#collectReferences', function() {
		it('(1) default', function() {
			var refs = backend.collectReferences([
				{
					actor: 'User:123456',
					object: 'Tweet:00001',
					other: 'something'
				},
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
				},
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

	it('#getIdFromRef', function() {
		expect(backend.getIdFromRef).to.be.a(Function);

		var ref = backend.getIdFromRef('User:1234');

		expect(ref).to.be('1234');
	});

	it('#getClassFromRef', function() {
		expect(backend.getClassFromRef).to.be.a(Function);

		var mc = backend.getClassFromRef('user');

		expect(mc).to.be(undefined);
	});

	describe('#loadFromStorage', function() {
		var modelClass = {
			find: function(ids) {
				expect(ids).to.eql({ id: [0, 1, 2] });

				return {
					exec: function(cb) {
						cb(null, [{ id: 0 }, { id: 1 }, { id: 2 }]);
					}
				};
			},
		};

		it('#loadFromStorage', function(done) {
			expect(backend.loadFromStorage).to.be.a(Function);

			function cb(err, found) {
				done();
			}

			backend.loadFromStorage(modelClass, [0, 1, 2], cb);
		});

		it('#loadFromStorage', function(done) {
			expect(backend.loadFromStorage).to.be.a(Function);

			modelClass = extend({}, modelClass);
			modelClass['pathsToPopulate'] = function() {};

			function cb(err, found) {
				done();
			}

			backend.loadFromStorage(modelClass, [0, 1, 2], cb);
		});
	});
});
