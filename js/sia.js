'use strict'

// Library for making requests
const Request = require('request')

// Necessary node libraries to make sia.js emit events
const Util = require('util')
const EventEmitter = require('events')

/**
 * SiadWrapper, a closure, initializes siad as a background process and
 * provides functions to interact with it
 * @class SiadWrapper
 */
function SiadWrapper () {
  // siad details with default values
  var siad = {
    fileName: process.platform === 'win32' ? 'siad.exe' : 'siad',
    detached: false,
    running: false,
    agent: 'Sia-Agent',
    address: 'localhost:9980',
    rpcAddress: ':9981',
    hostAddress: ':9982',
    path: require('path').join(__dirname, '..', 'Sia')
  }
  // Keep reference to `this` to emit events from within contexts where `this`
  // does not point to this class
  var self = this
  // Inherit `EventEmitter` properties
  EventEmitter.call(this)

  /**
   * Relays calls to daemonAPI with the localhost:port address appended
   * @function SiadWrapper#call
   * @param {apiCall} call - function to run if Siad is running
   * @param {apiResponse} callback
   * @returns {object} request call object
   */
  function apiCall (call, callback) {
    // Interpret string-only calls. Will default to 'GET' requests
    if (typeof call === 'string') {
      call = { url: call }
    }

    // Setup request
    call.url = 'http://' + siad.address + call.url
    call.json = true
    call.headers = {
      'User-Agent': siad.agent
    }

    // Return the request sent if the user wants to be creative and get more
    // information than what's passed to the callback
    return new Request(call, function (err, response, body) {
      // The error from Request should be null if siad is running
      siad.running = !err

      // If siad puts out an error, pass it as first argument to callback
      if (!err && response.statusCode !== 200) {
        err = body
        body = null
      }

      // Return results to callback
      if (callback !== undefined) {
        callback(err, body)
      }
    })
  }

  // Checks whether siad is running on the current address
  function checkIfSiadRunning (callback) {
    return apiCall('/daemon/version', function (err) {
      // There should be no reason this call would error if siad were running
      // and serving requests
      siad.running = !err

      // Return result to callback
      if (callback !== undefined) {
        callback(siad.running)
      }
    })
  }

  /**
   * Checks whether siad is running and runs ones of two callbacks
   * @function SiadWrapper#ifRunning
   * @param {callback} is - called if siad is running
   * @param {callback} not - called if siad is not running
   * @returns {object} request call object
   */
  function ifSiadRunning (is, not) {
    return checkIfSiadRunning(function (running) {
      if (running && is !== undefined) {
        is()
      } else if (not !== undefined) {
        not()
      }
    })
  }

  /**
   * Synchronous way to check if siad is running, may not be up to date
   * @function SiadWrapper#isRunning
   * @returns {boolean} whether siad is running
   */
  function isSiadRunning (callback) {
    return siad.running
  }

  // Polls the siad API until it comes online
  function waitUntilLoaded (callback) {
    return ifSiadRunning(callback, function () {
      setTimeout(function () {
        waitUntilLoaded(callback)
      }, 1000)
    })
  }

  /**
   * Starts the daemon as a long running background process
   * @param {callback} callback - function to be run if successful
   * @returns {boolean} if start was attempted
   */
  function start (callback) {
    // Check if siad is already running
    if (siad.running) {
      if (callback !== null) {
        callback(new Error('Attempted to start siad when it was already running'))
      }
      return false
    }

    // Check synchronously if siad doesn't exist at siad.path
    const fs = require('fs')
    try {
      require('fs').statSync(siad.path)
    } catch (e) {
      if (callback !== null) {
        callback(e)
      }
      return false
    }

    // Set siad folder as configured siad.path
    var processOptions = {
      cwd: siad.path
    }

    // If the detached option is set, spawn siad as a separate process to be
    // run in the background after the parent process has closed
    if (siad.detached) {
      let log = require('path').join(siad.path, 'out.log')
      let out = fs.openSync(log, 'a')
      let err = fs.openSync(log, 'a')
      processOptions.detached = true
      processOptions.stdio = [ 'ignore', out, err ]
    }

    // Spawn siad
    const Process = require('child_process').spawn
    var daemonProcess = new Process(siad.fileName, [
      '--agent=' + siad.agent,
      '--api-addr=' + siad.address,
      '--rpc-addr=' + siad.rpcAddress,
      '--host-addr=' + siad.hostAddress,
      '--sia-directory=' + siad.path
    ], processOptions)

    // Exclude it from the parent process' event loop if detached
    if (siad.detached) {
      daemonProcess.unref()
    } else {
      // Listen for siad events and emit them from wrapper
      // TODO: Attach these to siad if it's already running
      var childProcessEvents = ['close', 'disconnect', 'error', 'message']
      childProcessEvents.forEach(function (ev) {
        daemonProcess.on(ev, function (arg1, arg2) {
          self.emit(ev, arg1, arg2)
        })
      })
      daemonProcess.on('exit', function (code) {
        siad.running = false
        self.emit('exit', code)
      })
    }

    // Wait until siad finishes loading to call callback
    waitUntilLoaded(callback)
    return true
  }

  /**
   * Sends a stop call to the daemon
   * @param {callback} callback - function to be run if successful
   * @returns {boolean} if stop was attempted, should always be true
   */
  function stop (callback) {
    apiCall('/daemon/stop', function (err) {
      if (!err) {
        siad.running = false
      }
      if (callback !== undefined) {
        callback(err)
      }
    })
    return true
  }

  /**
   * Sets the member variables based on the passed config. Checks if siad is
   * running on the new configuration so siad.running should be up to date for
   * the callback
   * @param {config} c - the config object derived from config.json
   * @param {callback} callback - first argument is any errors, second argument
   * is the new configuration
   * @returns {object} siad configuration object
   */
  function configure (settings, callback) {
    for (let key in settings) {
      // Set passed in settings within siad
      if (siad.hasOwnProperty(key)) {
        siad[key] = settings[key]
      }
    }
    checkIfSiadRunning(function (check) {
      if (callback !== undefined) {
        callback(null, siad)
      }
    })
    return siad
  }

  /**
   * Downloads siad and siac to a specified or default location
   * @param {string} path - An optional location of where to download to
   * @param {callback} callback
   * @returns {boolean} if download was started, should always be true
   */
  function download (path, callback) {
    if (typeof path === 'string') {
      siad.path = path
    } else {
      // the first argument is either undefined or the callback
      callback = path
      path = siad.path
    }
    return require('./download.js')(path, callback)
  }

  // Make certain members public
  this.call = function () {
    var args = []
    for (let i = 0; i < arguments.length; ++i) {
      args[i] = arguments[i]
    }
    // TODO: Don't understand why the setImmediate is needed, but without it,
    // some calls seems to not return right after another call but eventually
    // do return once another call is made. Some sort of resource blocking is
    // happnening
    setImmediate(function () {
      apiCall.apply(this, args)
    })
  }
  this.ifRunning = ifSiadRunning
  this.isRunning = isSiadRunning
  this.start = start
  this.stop = stop
  this.configure = configure
  this.download = download
}

// Inherit functions from `EventEmitter`'s prototype
Util.inherits(SiadWrapper, EventEmitter)

module.exports = new SiadWrapper()
