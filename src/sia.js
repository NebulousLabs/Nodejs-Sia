// sia.js: a lightweight node wrapper for starting, and communicating with
// a Sia daemon (siad).
import BigNumber from 'bignumber.js'
import { spawn } from 'child_process'
import request from 'request'

// Siacoin -> hastings unit conversion functions
// These make conversion between units of Sia easy and consistent for developers.
const hastingsPerSiacoin = new BigNumber('10').toPower(24)
const siacoinsToHastings = (siacoins) => new BigNumber(siacoins).times(hastingsPerSiacoin)
const hastingsToSiacoins = (hastings) => new BigNumber(hastings).dividedBy(hastingsPerSiacoin)

const call = (address, opts) => new Promise((resolve, reject) => {
	let callOptions = opts
	if (typeof opts === 'string') {
		callOptions = { url: opts }
	}
	callOptions.url = 'http://' + address + callOptions.url
	callOptions.json = true
	callOptions.headers = {
		'User-Agent': 'Sia-Agent',
	}
	request(callOptions, (err, res, body) => {
		if (!err && res.statusCode !== 200) {
			reject(body)
		} else if (!err) {
			resolve(body)
		} else {
			reject(err)
		}
	})
})
// launch launches a new instance of siad using `settings`.
// this function can `throw`, callers should catch errors from `spawn`.
const launch = (settings) => {
	const opts = { }
	if (process.geteuid) {
		opts.uid = process.geteuid()
	}
	return spawn(settings.path, [ '--sia-directory=' + settings.datadir ], opts)
}
const isSiadRunning = (address, is = () => {}, not = () => {}) => {
	call(address, '/daemon/version')
	  .then(() => is())
	  .catch(() => not())
}

export {
	launch,
	isSiadRunning,
	call,
	siacoinsToHastings,
	hastingsToSiacoins,
}
