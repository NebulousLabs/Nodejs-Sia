'use strict'
/* global describe, it, before */

// Libraries required for testing
var Chai = require('chai')
var fs = require('fs')
var path = require('path')

// Chai's should syntax is executed to edit Object to have Object.should
var should = Chai.should()

// Test api calls
describe('API calls to', function () {
  var siad

  before('require siad', function () {
    siad = require('../index.js')
    return siad
  })

  describe('/consensus', function () {
    it('', function (done) {
      siad.consensus(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        var keys = ['height', 'currentblock', 'target']
        body.should.have.all.keys(keys)
        done()
      })
    })
    it('/block', function (done) {
      siad.consensus.block({
        height: 0
      }, function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('block')
        done()
      })
    })
  })

  describe('/wallet', function () {
    it('', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        var keys = ['encrypted', 'unlocked', 'confirmedsiacoinbalance', 'unconfirmedoutgoingsiacoins', 'unconfirmedincomingsiacoins', 'siafundbalance', 'siacoinclaimbalance']
        body.should.have.all.keys(keys)
        done()
      })
    })

    it('/address', function (done) {
      siad.wallet.address(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        done()
      })
    })

    it('/addresses', function (done) {
      siad.wallet.addresses(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        done()
      })
    })

    it('/backup', function (done) {
      var testloc = path.join(__dirname, 'test', '.test')
      fs.closeSync(fs.openSync(testloc, 'w'))
      siad.wallet.backup({
        filepath: testloc
      }, function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('Success')
        done()
      })
    })

    it('/init', function (done) {
      siad.wallet.init({
        dictionary: 'english'
      }, function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('primaryseed')
      })
    })

    it('/load/033x', function (done) {
      siad.wallet.load.fromFork({
      }, function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/load/seed', function (done) {
      siad.wallet.load.seed(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/load/siag', function (done) {
      siad.wallet.load.siag(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/lock', function (done) {
      siad.wallet.lock(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/seeds', function (done) {
      siad.wallet.seeds(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/siacoins', function (done) {
      siad.wallet.siacoins(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/siafunds', function (done) {
      siad.wallet.siafunds(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/transaction/$(id)', function (done) {
      siad.wallet.transaction(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/transactions', function (done) {
      siad.wallet.transactions(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/transactions/$(addr)', function (done) {
      siad.wallet.transactions(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/unlock', function (done) {
      siad.wallet.unlock(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })
  })
})
