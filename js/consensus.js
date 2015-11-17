'use strict'

var call
var mod = '/consensus'

function consensus (callback) {
  call({
    url: mod,
    method: 'GET'
  }, callback)
}

consensus.block = function (params, callback) {
  call({
    url: mod + '/block',
    method: 'GET',
    qs: params
  }, callback)
}

module.exports = function (requester) {
  call = requester
  return consensus
}
