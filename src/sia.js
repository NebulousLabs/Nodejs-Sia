// sia.js: a lightweight node wrapper for starting, and communicating with
// a Sia daemon (siad).
import BigNumber from 'bignumber.js'

// Siacoin -> hastings unit conversion functions
// These make conversion between units of Sia easy and consistent for developers.
const hastingsPerSiacoin = new BigNumber('10').toPower(24)
export const siacoinsToHastings = (siacoins) => new BigNumber(siacoins).times(hastingsPerSiacoin)
export const hastingsToSiacoins = (hastings) => new BigNumber(hastings).dividedBy(hastingsPerSiacoin)
