/* eslint-disable no-unused-expressions */
import 'babel-polyfill'
import BigNumber from 'bignumber.js'
import { siacoinsToHastings, hastingsToSiacoins } from '../src/sia.js'
import { expect } from 'chai'
import proxyquire from 'proxyquire'
import { spy } from 'sinon'
// Mock the process calls required for testing Siad launch functionality.
const mock = {
	'child_process': {
		spawn: spy(),
	},
}
const { launch } = proxyquire('../src/sia.js', mock)

BigNumber.config({DECIMAL_PLACES: 28})

const hastingsPerSiacoin = new BigNumber('1000000000000000000000000')

describe('sia.js wrapper library', () => {
	describe('unit conversion functions', () => {
		it('converts from siacoins to hastings correctly', () => {
			const maxSC = new BigNumber('100000000000000000000000')
			for (let i = 0; i < 999; i++) {
				const sc = maxSC.times(Math.trunc(Math.random() * 100000) / 100000)
				const expectedHastings = sc.times(hastingsPerSiacoin)
				expect(siacoinsToHastings(sc).toString()).to.equal(expectedHastings.toString())
			}
		})
		it('converts from hastings to siacoins correctly', () => {
			const maxH = new BigNumber('10').toPower(150)
			for (let i = 0; i < 999; i++) {
				const h = maxH.times(Math.trunc(Math.random() * 100000) / 100000)
				const expectedSiacoins = h.dividedBy(hastingsPerSiacoin)
				expect(hastingsToSiacoins(h).toString()).to.equal(expectedSiacoins.toString())
			}
		})
		it('does not lose precision during unit conversions', () => {
			// convert from base unit -> siacoins n_iter times, comparing the (n_iter-times) converted value at the end.
			// if precision loss were occuring, the original and the converted value would differ.
			const n_iter = 10000
			const originalSiacoin = new BigNumber('1337338498282837188273')
			let convertedSiacoin = originalSiacoin
			for (let i = 0; i < n_iter; i++) {
				convertedSiacoin = hastingsToSiacoins(siacoinsToHastings(convertedSiacoin))
			}
			expect(convertedSiacoin.toString()).to.equal(originalSiacoin.toString())
		})
	})
	describe('siad interaction functions', () => {
		describe('launch', () => {
			it('starts siad with the given settings', () => {
				const testSettings = {
					datadir: '/test/data',
					path: '/test/siad',
				}
				launch(testSettings)
				expect(mock['child_process'].spawn.calledWith(testSettings.path, ['--sia-directory=' + testSettings.datadir])).to.be.true
			})
		})
	})
})

/* eslint-enable no-unused-expressions */
