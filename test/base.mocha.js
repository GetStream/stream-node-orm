var should = require('should');
var BaseBackend = require('../src/backends/base.js');

describe('StreamBackend', function() {

    it('should have right properties', function() {
        new BaseBackend().should.have.property('collectReferences');
        new BaseBackend().should.have.property('enrichActivities');
        new BaseBackend().should.have.property('enrichAggregatedActivities');
    });

    it('#collectReferences()', function() {
    });

    it('#retreiveObjects()', function() {
    });

    it('#enrichActivities()', function() {
    });

    it('#enrichAggregatedActivities()', function() {
    });

});
