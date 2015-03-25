var should = require('should');
var Enricher = require('../src/Enricher.js');

describe('Enricher', function() {

    it('should have right properties', function() {
        new Enricher().should.have.property('setFields');
        new Enricher().should.have.property('collectReferences');
        new Enricher().should.have.property('enrichActivities');
        new Enricher().should.have.property('enrichAggregatedActivities');
    });

    it('#setFields()', function() {
        var enricher = new Enricher();
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
