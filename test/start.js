'use strict';

// Libraries required for testing
var Chai = require('chai');
var ChaiAsPromised = require('chai-as-promised');
var Path = require('path');

// Chai's should syntax is executed to edit Object to have Object.should
var should = Chai.should();
// Chai's should syntax is extended to deal well with Promises
Chai.use(ChaiAsPromised);
