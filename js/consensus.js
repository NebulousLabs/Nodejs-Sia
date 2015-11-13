'use strict';

var call;
var mod = '/consensus';
function consensus(callback) {
	call({
		url: mod,
		method: 'GET',
	}, callback);
}

consensus.block = function(height, callback) {
	call({
		url: mod + '/block',
		method: 'GET',
		qs: height,
	}, callback);
}

module.exports = function(requester) {
	call = requester;
	return consensus;
};
