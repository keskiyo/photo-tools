import { describe, expect, it } from 'vitest'

import { rateLimitResultFromCount } from '@/lib/distributed-rate-limit'

describe('rateLimitResultFromCount', () => {
	it('allows counts within the limit', () => {
		expect(rateLimitResultFromCount(2, 3, 1000)).toEqual({
			ok: true,
			limit: 3,
			remaining: 1,
			retryAfterMs: 0,
		})
	})

	it('blocks counts above the limit and reports retry time', () => {
		expect(rateLimitResultFromCount(4, 3, 2500)).toEqual({
			ok: false,
			limit: 3,
			remaining: 0,
			retryAfterMs: 2500,
		})
	})
})
