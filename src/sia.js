// sia.js: a lightweight node wrapper for starting, and communicating with
// a Sia daemon (siad).
import BigNumber from 'bignumber.js'
import { spawn } from 'child_process'
import request from 'request'

// sia.js error constants
export const errCouldNotConnect = new Error('could not connect to the Sia daemon')

// Siacoin -> hastings unit conversion functions
// These make conversion between units of Sia easy and consistent for developers.
const hastingsPerSiacoin = new BigNumber('10').toPower(24)
const siacoinsToHastings = (siacoins) => new BigNumber(siacoins).times(hastingsPerSiacoin)
const hastingsToSiacoins = (hastings) => new BigNumber(hastings).dividedBy(hastingsPerSiacoin)

// Call makes a call to the Sia API at `address`, with the request options defined by `opts`.
// returns a promise which resolves with the response if the request completes successfully
// and rejects with the error if the request fails.
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
// this function can `throw`, callers should catch errors.
// callers should also handle the lifecycle of the spawned process.
const launch = (settings) => {
	const opts = { }
	if (process.geteuid) {
		opts.uid = process.geteuid()
	}
	return spawn(settings.path, [ '--sia-directory=' + settings.datadir ], opts)
}

// isRunning returns true if a successful call can be to /daemon/version
// using the address provided in `address`.
async function isRunning(address) {
	try {
		await call(address, '/daemon/version')
		return true
	} catch (e) {
		return false
	}
}

// siadWrapper returns an instance of a Siad API configured with address.
const siadWrapper = (address) => {
	const siadAddress = address
	return {
		call: (options) => call(siadAddress, options),
		isRunning: () => isRunning(siadAddress),
	}
}

// connect connects to a running Siad at `address` and returns a siadWrapper object.
async function connect(address) {
	const running = await isRunning(address)
	if (!running) {
		throw errCouldNotConnect
	}
	return siadWrapper(address)
}

export {
	connect,
	launch,
	isRunning,
	call,
	siacoinsToHastings,
	hastingsToSiacoins,
}
