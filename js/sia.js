'use strict'

// Library for making requests
const request = require('request')

// Necessary node libraries to make sia.js emit events
const Util = require('util')
const EventEmitter = require('events')
const nodePath = require('path')

/**
 * SiadWrapper, a closure, initializes siad as a background process and
 * provides functions to interact with it
 * @class SiadWrapper
 */
function SiadWrapper () {
  // siad details with default values
  var settings = {
    detached: false,
    address: 'localhost:9980',
    rpcAddress: ':9981',
    hostAddress: ':9982',
    datadir: nodePath.join(__dirname, '../Sia'),
    path: nodePath.join(__dirname, '../Sia/', process.platform === 'win32' ? 'siad.exe' : 'siad')
  }
  // Tracks if siad was last known to be running or not
  var running = false
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
    call.url = 'http://' + settings.address + call.url
    call.json = true
    call.headers = {
      'User-Agent': 'Sia-Agent'
    }

    // Return the request sent if the user wants to be creative and get more
    // information than what's passed to the callback
    // TODO: Don't understand why the setImmediate is needed, but without it,
    // some calls seem to not return right after another call but eventually do
    // return once another call is made. Some sort of resource blocking is
    // happening
    setImmediate(function () {
      request(call, function (err, response, body) {
        // The error from request should be null if siad is running
        running = !err

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
    })
  }

  // Checks whether siad is running on the current address
  function checkIfSiadRunning (callback) {
    return apiCall('/daemon/version', function (err) {
      // There should be no reason this call would error if siad were running
      // and serving requests
      running = !err

      // Return result to callback
      if (callback !== undefined) {
        callback(running)
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
    return running
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
    if (running) {
      if (callback !== null) {
        callback(new Error('Attempted to start siad when it was already running'))
      }
      return false
    }

    // Check synchronously if siad doesn't exist at settings.path
    const fs = require('fs')
    try {
      require('fs').statSync(settings.path)
    } catch (e) {
      if (callback !== null) {
        callback(e)
      }
      return false
    }

    // Set siad folder as configured settings.datadir
    var processOptions = {
      cwd: settings.datadir
    }

    // If the detached option is set, spawn siad as a separate process to be
    // run in the background after the parent process has closed
    if (settings.detached) {
      let log = nodePath.join(settings.datadir, 'out.log')
      let out = fs.openSync(log, 'a')
      let err = fs.openSync(log, 'a')
      processOptions.detached = true
      processOptions.stdio = [ 'ignore', out, err ]
    }

    // Spawn siad
    const Process = require('child_process').spawn
    var daemonProcess = new Process(settings.path, [
      '--api-addr=' + settings.address,
      '--rpc-addr=' + settings.rpcAddress,
      '--host-addr=' + settings.hostAddress,
      '--sia-directory=' + settings.datadir
    ], processOptions)

    // Exclude it from the parent process' event loop if detached
    if (settings.detached) {
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
        running = false
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
        running = false
      }
      if (callback !== undefined) {
        callback(err)
      }
    })
    return true
  }

  /**
   * Sets the member variables based on the passed config. Checks if siad is
   * running on the new configuration so running should be up to date for
   * the callback
   * @param {config} c - the config object derived from config.json
   * @param {callback} callback - first argument is any errors, second argument
   * is the new configuration
   * @returns {object} siad configuration object
   */
  function configure (newSettings, callback) {
    for (let key in settings) {
      // Set passed in settings within siad
      if (settings.hasOwnProperty(key) && newSettings.hasOwnProperty(key)) {
        settings[key] = newSettings[key]
      } else if (settings.hasOwnProperty(key)) {
        // Set settings to sync with siad
        newSettings[key] = settings[key]
      }
    }
    if (callback !== undefined) {
      checkIfSiadRunning(function (check) {
        callback(null, settings)
      })
    }
    return settings
  }

  /**
   * Downloads siad and siac to a specified or default location
   * @param {string} path - An optional location of where to download to
   * @param {callback} callback
   * @returns {boolean} if download was started, should always be true
   */
  function download (path, callback) {
    if (typeof path === 'string') {
      settings.path = path
    } else {
      // the first argument is either undefined or the callback
      callback = path
      path = settings.path
    }
    return require('./download.js')(path, callback)
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
