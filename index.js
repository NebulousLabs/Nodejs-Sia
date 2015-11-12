'use strict';

function siad(port) {
	this.port = port || '9980';
	this.address = '127.0.0.1:' + port;
	this.request = require('request');
}

module.exports = siad;
