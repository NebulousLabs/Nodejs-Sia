// sia.js: a lightweight node wrapper for starting, and communicating with
// a Sia daemon (siad).
import BigNumber from 'bignumber.js'
import fs from 'fs'
import { spawn } from 'child_process'
import request from 'request'

// sia.js error constants
export const errCouldNotConnect = new Error('could not connect to the Sia daemon')

// Siacoin -> hastings unit conversion functions
// These make conversion between units of Sia easy and consistent for developers.
// Never return exponentials from BigNumber.toString, since they confuse the API
BigNumber.config({ EXPONENTIAL_AT: 1e+9 })
BigNumber.config({ DECIMAL_PLACES: 30 })

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
	if (typeof callOptions.timeout === 'undefined') {
		callOptions.timeout = 10000
	}
	callOptions.headers = {
		'User-Agent': 'Sia-Agent',
	}

	request(callOptions, (err, res, body) => {
		if (!err && (res.statusCode < 200 || res.statusCode > 299)) {
			reject(body)
		} else if (!err) {
			resolve(body)
		} else {
			reject(err)
		}
	})
})

// launch launches a new instance of siad using the flags defined by `settings`.
// this function can `throw`, callers should catch errors.
// callers should also handle the lifecycle of the spawned process.
const launch = (path, settings) => {
	const defaultSettings = {
		'api-addr': 'localhost:9980',
		'host-addr': ':9982',
		'rpc-addr': ':9981',
		'authenticate-api': false,
		'disable-api-security': false,
		'modules': 'cghmrtw',
	}
	const mergedSettings = Object.assign(defaultSettings, settings)
	const filterFlags = (key) => mergedSettings[key] !== false
	const mapFlags = (key) => '--' + key + '=' + mergedSettings[key]
	const flags = Object.keys(mergedSettings).filter(filterFlags).map(mapFlags)

	const siadOutput = fs.openSync('./siad-output.log', 'a')
	const opts = {
		'stdio': [ process.stdin, siadOutput, siadOutput ],
	}
	if (process.geteuid) {
		opts.uid = process.geteuid()
	}
	return spawn(path, flags, opts)
}

// isRunning returns true if a successful call can be to /gateway
// using the address provided in `address`.  Note that this call does not check
// whether the siad process is still running, it only checks if a Sia API is
// reachable.
async function isRunning(address) {
	try {
		await call(address, '/gateway')
		return true
	} catch (e) {
		return false
	}
}

// siadWrapper returns an instance of a Siad API configured with address.
const siadWrapper = (address) => {
	const siadAddress = address
	return {
		call: (options)  => call(siadAddress, options),
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
