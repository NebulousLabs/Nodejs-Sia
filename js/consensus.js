'use strict';

var call;
function consensus(callback) {
	var module = '/consensus'
	call({
		url: module,
		method: 'GET',
	}, callback);
}

consensus.block = function(height, callback) {
	call({
		url: module + '/block',
		method: 'GET',
		qs: height,
	}, callback);
}

module.exports = function(requester) {
	call = requester;
	return consensus;
};
