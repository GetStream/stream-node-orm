var expect = require('expect.js'),
	mockery = require('mockery'),
	path = require('path'),
	pmock = require('pmock'),
	Config = require('../src/config'),
	BaseBackend = require('../src/backends/base.js'),
	FeedManager = require('../src/FeedManager'),
	main = require('../src/index');

describe('StreamBackend', function() {
	it('should have right properties', function() {
		new BaseBackend().should.have.property('collectReferences');
		new BaseBackend().should.have.property('enrichActivities');
		new BaseBackend().should.have.property('enrichAggregatedActivities');
	});

	it('#collectReferences()', function() {});

	it('#retreiveObjects()', function() {});

	it('#enrichActivities()', function() {});

	it('#enrichAggregatedActivities()', function() {});
});

describe('feedManagerFactory', function() {
	it('should return a FeedManager instance', function() {
		var fm = main.feedManagerFactory({});

		expect(fm).to.be.a(FeedManager);
	});

	it('should ignore unkown settings', function() {
		var fm = main.feedManagerFactory({
			unknown: 'abcdefg',
		});

		expect(fm).to.be.a(FeedManager);
		expect(fm.settings.unknown).to.be.undefined;
	});

	it('should override known settings', function() {
		var fm = main.feedManagerFactory({
			apiKey: 'abcdefg',
		});

		expect(fm).to.be.a(FeedManager);
		expect(fm.settings.apiKey).to.be('abcdefg');
	});
});

describe('Config', function() {
	it('default config', function() {
		var settings = main.FeedManager.settings;

		var expected = require('../getstream.js').config;
		expect(settings).to.eql(expected);
	});
});

describe.skip('Config Env Var', function() {
	var configDir = path.join(__dirname, './tmp');
	var configFile = path.join(configDir, 'getstream.js');

	before(function() {
		this.env = pmock.env({
			STREAM_NODE_CONFIG_DIR: configDir,
		});

		mockery.enable({
			warnOnUnregistered: false,
			useCleanCache: true,
		});
		mockery.registerMock('fs', {
			existsSync: function() {
				return true;
			},
		});
		mockery.registerMock(configFile, { config: { apiKey: 12345 } });
	});

	after(function() {
		mockery.disable();
		this.env.reset();
	});

	/**
     * Mockery doesn't work correctly here
     * SKip this test until we fix that
     */
	it.skip('env var config dir', function() {
		var settings = Config();

		expect(settings.apiKey).to.be(12345);
	});
});

describe('Config Default', function() {
	before(function() {
		this.cwd = pmock.cwd('/tmp');
	});

	after(function() {
		this.cwd.reset();
	});

	it('env var config dir', function() {
		var settings = Config();

		var expected = require('../src/config.default.js').config;

		expect(settings).to.eql(expected);
	});
});
