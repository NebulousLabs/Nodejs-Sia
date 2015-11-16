'use strict'

var call
var mod = '/wallet'

function wallet (callback) {
  call({
    url: mod,
    method: 'GET'
  }, callback)
}

wallet.address = function (callback) {
  call({
    url: mod + '/address',
    method: 'GET'
  }, callback)
}

wallet.addresses = function (callback) {
  call({
    url: mod + '/addresses',
    method: 'GET'
  }, callback)
}

wallet.backup = function (params, callback) {
  call({
    url: mod + '/backup',
    method: 'POST',
    qs: params
  }, callback)
}

wallet.init = function (params, callback) {
  call({
    url: mod + '/init',
    method: 'POST',
    qs: params
  }, callback)
}

wallet.load = {}

wallet.load['033x'] = function (params, callback) {
  call({
    url: mod + '/load/033x',
    method: 'POST',
    qs: params
  }, callback)
}

wallet.load.seed = function (params, callback) {
  call({
    url: mod + '/load/seed',
    method: 'POST',
    qs: params
  }, callback)
}

wallet.load.siag = function (params, callback) {
  call({
    url: mod + '/load/siag',
    method: 'POST',
    qs: params
  }, callback)
}

wallet.lock = function (callback) {
  call({
    url: mod + '/lock',
    method: 'POST'
  }, callback)
}

wallet.seeds = function (params, callback) {
  call({
    url: mod + '/seeds',
    method: 'GET',
    qs: params
  }, callback)
}

wallet.siacoins = function (params, callback) {
  call({
    url: mod + '/siacoins',
    method: 'POST',
    qs: params
  }, callback)
}

wallet.siafunds = function (params, callback) {
  call({
    url: mod + '/siafunds',
    method: 'POST',
    qs: params
  }, callback)
}

wallet.transaction = function (id, callback) {
  call({
    url: mod + '/transaction/',
    method: 'GET'
  }, callback)
}

wallet.transactions = function (arg, callback) {
  // Works for both '/transactions/$(addr)' and '/transactions'
  var addr = arg === 'string' ? '/' + arguments[0] : ''
  var params = arg === 'object' ? arguments[0] : undefined
  call({
    url: mod + '/transactions' + addr,
    method: 'GET',
    qs: params
  }, callback)
}

wallet.unlock = function (callback) {
  call({
    url: mod + '/unlock',
    method: 'POST'
  }, callback)
}

module.exports = function (requester) {
  call = requester
  return wallet
}
