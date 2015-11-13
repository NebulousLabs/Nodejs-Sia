'use strict';

// Libraries required for testing
var Chai = require('chai');
var Path = require('path');

// Chai's should syntax is executed to edit Object to have Object.should
var should = Chai.should();

// Test api calls
describe('API calls', function() {
	var siad;

	before('require siad', function() {
		siad = require('../index.js');
		return siad;
	});

	// Test basic startup properties
	describe('consensus', function() {
		it('/consensus', function(done) {
			siad.consensus(function(err, body) {
				should.not.exist(err);
				should.exist(body);
				body.should.ownProperty('height');
				body.should.ownProperty('currentblock');
				body.should.ownProperty('target');
				done();
			});
		});
		it('/consensus/block', function(done) {
			siad.consensus.block(0, function(err, body) {
				should.be.null(err);
				should.not.be.null(body);
				body.should.ownProperty('block');
				done();
			});
		});
	});
});
