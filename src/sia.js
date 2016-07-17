// sia.js: a lightweight node wrapper for starting, and communicating with
// a Sia daemon (siad).
import BigNumber from 'bignumber.js'
import { spawn } from 'child_process'

// Siacoin -> hastings unit conversion functions
// These make conversion between units of Sia easy and consistent for developers.
const hastingsPerSiacoin = new BigNumber('10').toPower(24)
export const siacoinsToHastings = (siacoins) => new BigNumber(siacoins).times(hastingsPerSiacoin)
export const hastingsToSiacoins = (hastings) => new BigNumber(hastings).dividedBy(hastingsPerSiacoin)

// launch launches a new instance of siad using `settings`.
// this function can `throw`, callers should catch errors from `spawn`.
export const launch = (settings) => spawn(settings.path, [ '--sia-directory=' + settings.datadir ])

