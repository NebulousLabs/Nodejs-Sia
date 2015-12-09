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
    path: require('path').join(__dirname, 'Sia'),
    address: 'http://localhost:9980',
    command: process.platform === 'win32' ? 'siad.exe' : 'siad',
    headers: {
      'User-Agent': 'Sia-Agent'
    },
    // Track if Daemon is running
    running: false
  }
  // Keep reference to `this` to emit events from within contexts where `this`
  // does not point to this class
  var self = this
  // Inherit `EventEmitter` properties
  EventEmitter.call(this)

  /**
   * Relays calls to daemonAPI with the localhost:port address appended
   * @function SiadWrapper#apiCall
   * @param {apiCall} call - function to run if Siad is running
   * @param {apiResponse} callback
   */
  function apiCall (call, callback) {
    // Interpret string-only calls. Will default to 'GET' requests
    if (typeof call === 'string') {
      call = { url: call }
    }

    // Setup request
    call.url = siad.address + call.url
    call.json = true
    call.headers = siad.headers
    return new Request(call, function (error, response, body) {
      // The error from Request should be null if siad is running
      siad.running = !error

      // If siad puts out an error, return it
      if (!error && response.statusCode !== 200) {
        error = body
        body = null
      }

      // Return results to callback
      if (typeof callback === 'function') {
        callback(error, body)
      }
    })
  }

  // Checks whether siad is running on the current address
  function checkIfSiadRunning (callback) {
    apiCall('/daemon/version', function (err) {
      // There should be no reason this call would error if siad were running
      // and serving requests
      siad.running = !err

      // Return result to callback
      if (typeof callback === 'function') {
        callback(siad.running)
      }
    })
  }

  /**
   * Checks whether siad is running and runs ones of two callbacks
   * @function SiadWrapper#ifSiadRunning
   * @param {callback} is - called if siad is running
   * @param {callback} not - called if siad is not running
   */
  function ifSiadRunning (is, not) {
    checkIfSiadRunning(function (running) {
      if (running && typeof is === 'function') {
        is()
      } else if (typeof not === 'function') {
        not()
      }
    })
  }

  /**
   * Synchronous way to check if siad is running, may not be up to date
   * @function SiadWrapper#isRunning
   * @returns {boolean} whether siad is running
   */
  function isSiadRunning () {
    checkIfSiadRunning()
    return siad.running
  }

  // Polls the siad API until it comes online
  function waitUntilLoaded (callback) {
    ifSiadRunning(callback, function () {
      setTimeout(function () {
        waitUntilLoaded(callback)
      }, 1000)
    })
  }

  /**
   * Starts the daemon as a long running background process
   * @param {callback} callback - function to be run if successful
   */
  function start (callback) {
    if (siad.running) {
      callback(new Error('Attempted to start siad when it was already running'))
      return
    }

    // Check synchronously if siad doesn't exist at siad.path
    try {
      require('fs').statSync(siad.path)
    } catch (e) {
      callback(e)
      return
    }

    // Set siad folder as configured siadPath
    var processOptions = {
      cwd: siad.path
    }
    const Process = require('child_process').spawn
    var daemonProcess = new Process(siad.command, processOptions)

    // Listen for siad erroring
    daemonProcess.on('error', function (error) {
      self.emit('error', error)
    })
    daemonProcess.on('exit', function (code) {
      siad.running = false
      self.emit('exit', code)
    })

    // Wait until siad finishes loading to call callback
    waitUntilLoaded(callback)
  }

  /**
   * Sends a stop call to the daemon
   * @param {callback} callback - function to be run if successful
   */
  function stop (callback) {
    apiCall('/daemon/stop', function (err) {
      if (err) {
        callback(err)
      } else {
        siad.running = false
        callback(null)
      }
    })
  }

  /**
   * Sets the member variables based on the passed config
   * @param {config} c - the config object derived from config.json
   * @param {callback} callback - returns if siad is running
   */
  function configure (settings, callback) {
    for (var key in settings) {
      if (siad.hasOwnProperty(key)) {
        siad[key] = settings[key] || siad[key]
      }
    }
    if (callback !== undefined) {
      callback(null, siad)
    }
  }

  /**
   * Downloads siad and siac to a specified or default location
   * @param {string} path - An optional location of where to download to
   * @param {callback} callback
   */
  function download (path, callback) {
    if (typeof path === 'string') {
      siad.path = path
    } else {
      // the first argument is either undefined or the callback
      callback = path
      path = siad.path
    }
    require('./download.js')(path, callback)

    // Returns the path siad is downloaded to
    return path
  }

  // Make certain members public
  this.call = apiCall
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
