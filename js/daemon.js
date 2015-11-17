'use strict'

var call
var mod = '/daemon'

daemon = {}

daemon.stop = function (callback) {
  call({
    url: mod + '/stop',
    method: 'GET'
  }, callback)
}

daemon.version = function (callback) {
  call({
    url: mod + '/version',
    method: 'GET'
  }, callback)
}

daemon.updates = {}

daemon.updates.apply = function (params, callback) {
  call({
    url: mod + '/updates/apply',
    method: 'GET',
    qs: params
  }, callback)
}

daemon.updates.check = function (callback) {
  call({
    url: mode + '/updates/check',
    method: 'GET'
  })
}

module.exports = function (requester) {
  call = requester
  return daemon
}
