'use strict';

function consensus(callback) {
	this.block = function(height, cb) {
		this.request.get({
			url:this.address,
			qs:height,
		}, cb);
	}
	this.request.get(this.address, callback);
}

module.exports = consensus;
