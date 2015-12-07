'use strict'

// Library for making requests
var request = require('request')
var path = require('path')

// Default values
const defaults = {
  port: '9980',
  rpcPort: '9981',
  hostPort: '9982',
  host: 'http://localhost',
  address: 'http://localhost:9980',
  directory: path.join(__dirname, '..', 'Sia'),
  fileName: process.platform === 'win32' ? 'siad.exe' : 'siad'
}

// Options to be applied to every api call
const requestSettings = {
  headers: {
    'User-Agent': 'Sia-Agent'
  }
}

// Helper function to transfer object values
function addProps (from, onto) {
  for (var key in from) {
    if (from.hasOwnProperty(key)) {
      onto[key] = from[key]
	}
  }
}

// Add call options like headers to every call made
function call (opts, callback) {
  addProps(requestSettings, opts)
  opts.url = siad.address + opts.url
  request(opts, function (error, response, body) {
    // Catches improperly constructed JSONs that JSON.parse would
    // normally return a weird error on
    if (!error && response.statusCode === 200) {
      callback(error, JSON.parse(body))
    } else {
      callback(error, body)
    }
  })
}

// Given two callbacks, runs one of them depending on success of call to siad
function ifRunning (isRunning, isNotRunning) {
  var self = this
  this.daemon.version(function (err) {
    self.running = !err
    if (self.running) {
      isRunning()
    } else if (!self.running) {
      isNotRunning()
    }
  })
}

// Polls the siad API until it comes online
function waitForSiad (callback) {
  // TODO: emit 'started' event
  ifRunning(function() {
    console.log('Started siad!')
    callback()
  }, function() {
    // TODO: emit 'loaded' event
    // check once per second until successful
    setTimeout(waitForSiad, 1000)
    console.log('loading')
  })
}

// Object to export
var siad = {
  // Modules
  daemon: require('./js/daemon.js')(call),
  consensus: require('./js/consensus.js')(call),
  wallet: require('./js/wallet.js')(call),
  // Wrapper properties
  config: function (options) {
    addProps(options, this)
    return siad
  },
  download: function(path, callback) {
    if (typeof path === 'string') {
      this.directory = path
	} else {
      // the first argument is either undefined or the callback
	  callback = path
      path = this.directory
	}
    require('./js/download.js')(path, callback);
  }
  running: false,
  start: function (callback) {
    self = this
    ifRunning(function () {
      callback(new Error('siad is already running!'))
    }, function () {
      // daemon logs output to files
      var out, err
      Fs.open(Path.join(self.directory, 'daemonOut.log'), 'w', function(e, filedescriptor) {
        out = filedescriptor
      })
      Fs.open(Path.join(self.directory, 'daemonErr.log'), 'w', function(e, filedescriptor) {
        err = filedescriptor
      })

      // daemon process without parent stdio pipes
      var processOptions = {
        stdio: ['ignore', out, err],
        cwd: Path.join(__dirname, siaPath),
      }
      var daemonProcess = require('process').spawn(path.join(self.directory, self.fileName), processOptions)

      // Listen for siad erroring
      daemonProcess.on('error', function (error) {
        // TODO: emit events from the package itself
        if (error === 'ENOENT') {
          console.error('Missing siad!')
        } else {
          console.error('siad errored: ' + error)
        }
      })

      // Listen for siad exiting
      daemonProcess.on('exit', function(code) {
        self.running = false
        console.log('siad exited with code: ' + code, 'stop')
      })

      // Wait for siad to start
      waitForSiad(callback)
    })
  },
  stop: this.daemon.stop,
  ifRunning: ifRunning
}

// Add default and module properties
addProps(defaults, siad)
addProps(require('./js/siaMath.js'))

// Export
module.exports = siad
