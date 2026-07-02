import { afterEach, describe, expect, it, vi } from 'vitest'

describe('consumeDistributedRateLimit Redis fallback', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllEnvs()
		vi.resetModules()
	})

	it('uses in-memory rate limiting when Redis is unavailable', async () => {
		vi.stubEnv('REDIS_URL', 'redis://localhost:6379')
		vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		vi.doMock('ioredis', () => ({
			default: class RedisMock {
				on() {
					return this
				}

				incr() {
					return Promise.reject(new Error('Redis is down'))
				}

				disconnect() {}
			},
		}))

		const { consumeDistributedRateLimit } =
			await import('@/lib/distributed-rate-limit')

		const first = await consumeDistributedRateLimit('fallback-test', 1, 1000)
		const second = await consumeDistributedRateLimit('fallback-test', 1, 1000)

		expect(first.ok).toBe(true)
		expect(second.ok).toBe(false)
	})
})
