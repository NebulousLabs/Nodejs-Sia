'use strict'
/* global describe, it, before */

// Libraries required for testing
var Chai = require('chai')

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
      siad.consensus.block(0, function (err, body) {
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
      siad.wallet.backup(__dirname + '/backup', function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('Success')
        done()
      })
    })

    it('/init', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/load/033x', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/load/seed', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/load/siag', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/lock', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/seeds', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/siacoins', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/siafunds', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/transaction/$(id)', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/transactions', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/transactions/$(addr)', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })

    it('/unlock', function (done) {
      siad.wallet(function (err, body) {
        should.not.exist(err)
        should.exist(body)
        body.should.have.key('encrypted')
        body.should.have.key('unlocked')
      })
    })
  })
})
