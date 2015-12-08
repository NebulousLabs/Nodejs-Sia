'use strict'

// Libraries
var fs = require('fs')
var path = require('path')
var zlib = require('zlib') // for gunzip
var request = require('request')
var extract = process.platform === 'linux' ? require('tar') : require('unzip')

// Hard coded download details
const config = {
  baseUrl: 'https://github.com/NebulousLabs/Sia/releases/download/',
  siaVersion: 'v0.4.8-beta'
}

// helper to quit process and output error
function handleError (error) {
  if (!error) return

  var message = error.message || error
  console.error('Download failed: ' + message)
  process.exit(1)
}

// Function to download Sia release
module.exports = function (output, callback) {
  // Get target directory and filepath
  var outputDir, outputPath
  if (!output) {
    output = path.join(__dirname, 'Sia')
  }
  var lastIndex = output.lastIndexOf('/')
  outputPath = output.substring(0, lastIndex)
  outputDir = output.substring(lastIndex)

  // Interpret filename from process environment variables
  var platform, arch, extension
  platform = process.platform === 'win32' ? 'windows' : process.platform
  extension = process.platform === 'linux' ? '.tar.gz' : '.zip'
  switch (process.arch) {
    case 'x64':
      arch = 'amd64'
      break
    case 'ia32':
      arch = '386'
      break
    default:
      arch = process.arch
  }
  var extractedDirName = 'Sia-' + config.siaVersion + '-' + platform + '-' + arch
  var fileName = extractedDirName + extension
  var fullUrl = config.baseUrl + config.siaVersion + '/' + fileName

  // Setup download stream
  var requestStream = request(fullUrl)
  requestStream.on('error', handleError)

  // Setup extract stream
  var extractStream = extract.Extract({path: outputPath})
  extractStream.on('error', handleError)
  extractStream.on('close', function () {
    if (process.platform !== 'win32') {
      fs.chmod(outputPath, '755', handleError)
    }
  })

  // Pipe download stream to extract stream
  var download
  if (process.platform === 'linux') {
    download = requestStream.pipe(zlib.createGunzip()).pipe(extractStream)
  } else {
    download = requestStream.pipe(extractStream)
  }
  download.on('close', function () {
    fs.rename(path.join(outputPath, extractedDirName),
              path.join(outputPath, outputDir),
              callback)
  })
}

