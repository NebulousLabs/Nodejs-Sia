'use strict';

var Path = require('path');

// Default values
const defaults = {
	port: '9980',
	rpcPort: '9981',
	hostPort: '9982',
	host: 'http://localhost',
	address: 'http://localhost:9980',
	directory: Path.join(__dirname, '../Sia'),
	fileName: process.platform === 'win32' ? 'siad.exe' : 'sia',
};

// What we'll eventually export
var siad = {};

// Helper function to transfer object values
function addProps(from, onto) {
	for (var key in from) {
		onto[key] = from[key];
	}
}

// Set default values
addProps(defaults, siad);

// To set different values
siad.config = function(options) {
	if (!options) {
		return siad;
	}

	// extract options or defaults
	this.port = options.port || defaults.port;
	this.rpcPort = options.rpcPort || defaults.rpcPort;
	this.hostPort = options.hostPort || defaults.hostPort ;
	this.host = options.host || defaults.host;
	this.directory = options.directory || defaults.directory;
	this.fileName = options.fileName || defaults.fileName;
	this.address = this.host + ':' + this.port;
};

// Library for making requests
var request = require('request');

// Options to be applied to every api call
const requestSettings = {
	headers: {
		'User-Agent': 'Sia-Agent',
	},
}

// Add call options like headers to every call made
function call(opts, callback) {
	addProps(requestSettings, opts);
	opts.url = siad.address + opts.url;
	request(opts, callback);
}

// Modules
siad.consensus = require('./js/consensus.js')(call);

// export 
module.exports = siad;


