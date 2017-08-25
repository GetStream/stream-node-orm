var FeedManager = require('../src/FeedManager'),
	pmock = require('pmock'),
	mockery = require('mockery'),
	sinon = require('sinon'),
	expect = require('expect.js');

describe('FeedManager', function() {
	var fm;

	before(function() {
		// replace the module `request` with a stub object
		mockery.enable({});
		var requestStub = sinon.stub();
		mockery.registerMock('request', requestStub);

		this.env = pmock.env({
			STREAM_URL: null,
		});
	});

	beforeEach(function() {
		fm = new FeedManager({
			apiKey: 12345,
			apiSecret: 'abcdefg',
			apiAppId: 1000,
			apiLocation: 'qa',
			userFeed: 'user',
			notificationFeed: 'notification',
			newsFeeds: {
				flat: 'timeline',
				aggregated: 'timeline_aggregated',
			},
		});
	});

	it('#settings', function() {
		expect(fm.client.options.location).to.be('qa');
		expect(fm.client.apiKey).to.be(12345);
		expect(fm.client.apiSecret).to.be('abcdefg');
		expect(fm.client.appId).to.be(1000);
	});

	it('#getUserFeed', function() {
		var feed = fm.getUserFeed('matthisk');

		expect(feed.id).to.be('user:matthisk');
	});

	it('#getNotificationFeed', function() {
		var feed = fm.getNotificationFeed('matthisk');

		expect(feed.id).to.be('notification:matthisk');
	});

	it('#getNewsFeeds', function() {
		var feeds = fm.getNewsFeeds('matthisk');

		expect(feeds['timeline'].id).to.be('timeline:matthisk');
		expect(feeds['timeline_aggregated'].id).to.be(
			'timeline_aggregated:matthisk'
		);
	});

	it('#followUser', function() {
		var p = fm.followUser('harry', 'matthisk');

		expect(p.then).to.be.a(Function);
	});

	it('#unfollowUser', function() {
		var p = fm.unfollowUser('matthisk', 'harry');

		expect(p.then).to.be.a(Function);
	});

	after(function() {
		this.env.reset();
	});
});
