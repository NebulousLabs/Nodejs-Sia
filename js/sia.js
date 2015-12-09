'use strict'

// Library for making requests
const Request = require('request')

// Necessary node libraries
const Path = require('path')
const Util = require('util')
const EventEmitter = require('events')

/**
 * DaemonManager, a closure, initializes siad as a background process and
 * provides functions to interact with it
 * @class DaemonManager
 */
function DaemonManager () {
  // siad details with default values
  var siad = {
    path: Path.join(__dirname, 'Sia'),
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
   * @function DaemonManager#apiCall
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
  function checkRunning (callback) {
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
   * @function DaemonManager#ifSiadRunning
   * @param {callback} is - called if siad is running
   * @param {callback} not - called if siad is not running
   */
  function ifSiadRunning (is, not) {
    checkRunning(function (running) {
      if (running && typeof is === 'function') {
        is()
      } else if (typeof not === 'function') {
        not()
      }
    })
  }

  /**
   * Synchronous way to check if siad is running, may not be up to date
   * @function DaemonManager#isRunning
   * @returns {boolean} whether siad is running
   */
  function isSiadRunning () {
    checkRunning()
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

    // Set siad folder as configured siadPath
    var processOptions = {
      cwd: siad.path
    }
    const Process = require('child_process').spawn
    var daemonProcess = new Process(siad.command, processOptions)

    // Listen for siad erroring
    // TODO: How to change this error to give more accurate hint. Does
    // this work?
    daemonProcess.on('error', function (error) {
      if (error === 'Error: spawn ' + siad.command + ' ENOENT') {
        error.message = 'Missing siad!'
      }
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
      if (err)
        callback(err)
      else 
        siad.running = false
        callback(null)
    })
  }

  /**
   * Sets the member variables based on the passed config
   * @param {config} c - the config object derived from config.json
   * @param {callback} callback - returns if siad is running
   */
  function configure (settings, callback) {
    siad.path = settings.siad.path || siad.path
    siad.address = settings.siad.address || siad.address
    siad.command = settings.siad.command || siad.command
    if (typeof callback === 'function') {
      callback()
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
Util.inherits(DaemonManager, EventEmitter)

module.exports = new DaemonManager()
