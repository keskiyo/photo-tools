import { describe, expect, it } from 'vitest'

import {
	clientIpFromHeaders,
	createRateLimiter,
	resolveRateKey,
} from '@/lib/rate-limit'

describe('createRateLimiter.consume', () => {
	it('allows requests up to the limit, then blocks', () => {
		const rl = createRateLimiter()
		const start = 1_000

		const first = rl.consume('k', 3, 1000, start)
		const second = rl.consume('k', 3, 1000, start)
		const third = rl.consume('k', 3, 1000, start)
		const fourth = rl.consume('k', 3, 1000, start)

		expect(first.ok).toBe(true)
		expect(first.remaining).toBe(2)
		expect(second.ok).toBe(true)
		expect(third.ok).toBe(true)
		expect(third.remaining).toBe(0)
		expect(fourth.ok).toBe(false)
		expect(fourth.remaining).toBe(0)
		expect(fourth.retryAfterMs).toBe(1000)
	})

	it('resets after the window elapses', () => {
		const rl = createRateLimiter()
		rl.consume('k', 1, 1000, 0)
		expect(rl.consume('k', 1, 1000, 500).ok).toBe(false)
		// At/after resetAt (0 + 1000) a fresh window starts.
		expect(rl.consume('k', 1, 1000, 1000).ok).toBe(true)
	})

	it('keeps separate budgets per key', () => {
		const rl = createRateLimiter()
		rl.consume('a', 1, 1000, 0)
		expect(rl.consume('a', 1, 1000, 0).ok).toBe(false)
		expect(rl.consume('b', 1, 1000, 0).ok).toBe(true)
	})

	it('treats a zero limit as always blocked', () => {
		const rl = createRateLimiter()
		const result = rl.consume('k', 0, 1000, 0)
		expect(result.ok).toBe(false)
		expect(result.retryAfterMs).toBe(1000)
	})

	it('reset clears a single key or everything', () => {
		const rl = createRateLimiter()
		rl.consume('a', 1, 1000, 0)
		rl.consume('b', 1, 1000, 0)

		rl.reset('a')
		expect(rl.consume('a', 1, 1000, 0).ok).toBe(true)
		expect(rl.consume('b', 1, 1000, 0).ok).toBe(false)

		rl.reset()
		expect(rl.consume('b', 1, 1000, 0).ok).toBe(true)
	})
})

describe('peek + record (count only successful results)', () => {
	it('peek never increments the count on its own', () => {
		const rl = createRateLimiter()
		for (let i = 0; i < 10; i += 1) {
			expect(rl.peek('k', 1, 1000, 0).ok).toBe(true)
		}
	})

	it('blocks once recorded successes reach the limit', () => {
		const rl = createRateLimiter()
		expect(rl.peek('k', 2, 1000, 0).ok).toBe(true)
		rl.record('k', 1000, 0)
		expect(rl.peek('k', 2, 1000, 0).ok).toBe(true)
		rl.record('k', 1000, 0)
		expect(rl.peek('k', 2, 1000, 0).ok).toBe(false)
	})

	it('reports remaining budget from recorded successes', () => {
		const rl = createRateLimiter()
		rl.record('k', 1000, 0)
		expect(rl.peek('k', 3, 1000, 0).remaining).toBe(2)
	})

	it('resets recorded counts after the window elapses', () => {
		const rl = createRateLimiter()
		rl.record('k', 1000, 0)
		rl.record('k', 1000, 0)
		expect(rl.peek('k', 2, 1000, 500).ok).toBe(false)
		expect(rl.peek('k', 2, 1000, 1000).ok).toBe(true)
	})
})

describe('clientIpFromHeaders', () => {
	it('reads the first IP from x-forwarded-for', () => {
		const headers = new Headers({
			'x-forwarded-for': '203.0.113.7, 10.0.0.1',
		})
		expect(clientIpFromHeaders(headers)).toBe('203.0.113.7')
	})

	it('falls back through alternate proxy headers', () => {
		const headers = new Headers({ 'cf-connecting-ip': '198.51.100.4' })
		expect(clientIpFromHeaders(headers)).toBe('198.51.100.4')
	})

	it("returns 'unknown' when no IP header is present", () => {
		expect(clientIpFromHeaders(new Headers())).toBe('unknown')
	})
})

describe('resolveRateKey', () => {
	it('prefers the session user id when signed in', () => {
		const headers = new Headers({ 'x-forwarded-for': '203.0.113.7' })
		expect(resolveRateKey('generate', headers, 'user_123')).toBe(
			'generate:user:user_123',
		)
	})

	it('falls back to the client IP for anonymous requests', () => {
		const headers = new Headers({ 'x-forwarded-for': '203.0.113.7' })
		expect(resolveRateKey('generate', headers, null)).toBe(
			'generate:ip:203.0.113.7',
		)
	})
})
