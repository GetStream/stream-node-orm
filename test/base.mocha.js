var should = require('should');
var EnricherBase = require('../src/Enricher.js');

describe('EnricherBase', function() {

    it('should have right properties', function() {
        new EnricherBase().should.have.property('setFields');
        new EnricherBase().should.have.property('collectReferences');
        new EnricherBase().should.have.property('enrichActivities');
        new EnricherBase().should.have.property('enrichAggregatedActivities');
    });

    it('#setFields()', function() {
        var enricher = new EnricherBase();
        enricher.should.have.property('fields', ['actor', 'object']);
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
