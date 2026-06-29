import { describe, expect, it } from 'vitest'

import { computePairedDimension } from '@/app/(converter)/_hooks/use-converter-dimensions'

describe('computePairedDimension', () => {
	const source = { width: 1000, height: 500 } // 2:1 aspect ratio

	it('derives height from an edited width', () => {
		expect(computePairedDimension('width', 400, source)).toBe(200)
	})

	it('derives width from an edited height', () => {
		expect(computePairedDimension('height', 200, source)).toBe(400)
	})

	it('rounds to the nearest pixel', () => {
		expect(computePairedDimension('width', 333, { width: 1000, height: 500 })).toBe(
			167,
		)
	})

	it('never returns below 1', () => {
		expect(
			computePairedDimension('width', 1, { width: 1000, height: 1 }),
		).toBe(1)
	})
})
