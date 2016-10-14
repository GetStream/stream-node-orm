var should = require('should')
  , expect = require('expect.js')
  , fs = require('fs')
  , path = require('path')
  , Config = require('../src/config')
  , BaseBackend = require('../src/backends/base.js')
  , FeedManager = require('../src/FeedManager')
  , main = require('../src/index');

describe('StreamBackend', function () {

    it('should have right properties', function () {
        new BaseBackend().should.have.property('collectReferences');
        new BaseBackend().should.have.property('enrichActivities');
        new BaseBackend().should.have.property('enrichAggregatedActivities');
    });

    it('#collectReferences()', function () {
    });

    it('#retreiveObjects()', function () {
    });

    it('#enrichActivities()', function () {
    });

    it('#enrichAggregatedActivities()', function () {
    });

});

describe('feedManagerFactory', function() {

    it('should return a FeedManager instance', function() {
        var fm = main.feedManagerFactory({});

        expect(fm).to.be.a(FeedManager);
    });

    it('should ignore unkown settings', function() {
        var fm = main.feedManagerFactory({
            unknown: 'abcdefg'
        });

        expect(fm).to.be.a(FeedManager);
        expect(fm.settings.unknown).to.be.undefined;
    });

    it('should override known settings', function() {
        var fm = main.feedManagerFactory({
            apiKey: 'abcdefg'
        });

        expect(fm).to.be.a(FeedManager);
        expect(fm.settings.apiKey).to.be('abcdefg');
    });

});

describe('Feed manager', function() {

    it('default config', function() {
        var settings = main.FeedManager.settings;

        var expected = require('../getstream.js').config;
        expect(settings).to.eql(expected);
    });

    describe('haha', function() {
        var configDir = path.join(__dirname, './tmp');
        var configFile = path.join(configDir, 'getstream.js');

        before(function() {
            process.env.STREAM_NODE_CONFIG_DIR = configDir;

            fs.mkdirSync(configDir);
            fs.writeFileSync(configFile, 'exports.config = { apiKey: 12345 };');
        });

        after(function() { 
            fs.unlink(configFile);
            fs.rmdirSync(configDir);
            delete process.env.STREAM_NODE_CONFIG_DIR;            
        });

        it('env var config dir', function() {
            var settings = Config();

            expect(settings.apiKey).to.be(12345);
        });
    });


    it('override config', function() {

    });
});