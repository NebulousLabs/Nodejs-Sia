var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var request = require('request')
var archive = process.platform === 'linux' ? require('tar') : require('unzip')

const config = {
  baseUrl: 'https://github.com/NebulousLabs/Sia/releases/download/',
  siaVersion: 'v0.4.7-beta',
  outputPath: path.join(__dirname, 'Sia')
}

// Quit process and output error
function handleError (error) {
  if (!error) return

  var message = error.message || error
  console.error('Download failed: ' + message)
  process.exit(1)
}

// Download call
mkdirp(config.outputPath, function (error) {
  if (error) return handleError(error)

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
  var fileName = 'Sia-v' + config.siaVersion + '-' + platform + '-' + arch + extension
  var fullUrl = config.baseUrl + config.siaVersion + '/' + fileName

  // Setup download stream
  var requestStream = request(fullUrl)
  requestStream.on('error', handleError)

  // Setup extract stream
  var archiveStream = archive.Extract({path: config.outputPath})
  archiveStream.on('error', handleError)
  archiveStream.on('close', function () {
    if (process.platform !== 'win32') {
      fs.chmod(path.join(__dirname, 'bin', 'chromedriver'), '755', handleError)
    }
  })

  // Pipe download stream to extract stream
  requestStream.pipe(archiveStream)
})
