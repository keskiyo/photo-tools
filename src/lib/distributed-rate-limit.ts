import IORedis from 'ioredis'

import { rateLimiter, type RateLimitResult } from '@/lib/rate-limit'

let redis: IORedis | null = null
let redisUnavailableUntil = 0
let lastRedisErrorLogAt = 0

const REDIS_BACKOFF_MS = 30_000

export async function consumeDistributedRateLimit(
	key: string,
	limit: number,
	windowMs: number,
): Promise<RateLimitResult> {
	if (!process.env.REDIS_URL || Date.now() < redisUnavailableUntil) {
		return rateLimiter.consume(key, limit, windowMs)
	}

	try {
		const client = getRedisClient()
		if (client.status === 'wait') {
			await client.connect()
		}
		const redisKey = `rate-limit:${key}`
		const count = await client.incr(redisKey)
		if (count === 1) {
			await client.pexpire(redisKey, windowMs)
		}
		const ttl = await client.pttl(redisKey)
		return rateLimitResultFromCount(count, limit, ttl > 0 ? ttl : windowMs)
	} catch (error) {
		markRedisUnavailable(error)
		return rateLimiter.consume(key, limit, windowMs)
	}
}

export function rateLimitResultFromCount(
	count: number,
	limit: number,
	retryAfterMs: number,
): RateLimitResult {
	const ok = count <= limit
	return {
		ok,
		limit,
		remaining: Math.max(0, limit - count),
		retryAfterMs: ok ? 0 : retryAfterMs,
	}
}

function getRedisClient() {
	if (!redis) {
		const client = new IORedis(process.env.REDIS_URL!, {
			connectTimeout: 500,
			enableOfflineQueue: false,
			maxRetriesPerRequest: 1,
			lazyConnect: true,
			retryStrategy: () => null,
		})
		// Without an 'error' listener ioredis throws on connection blips and can
		// crash the process. Throttle logs and let requests fall back in-memory.
		client.on('error', error => {
			markRedisUnavailable(error, { disconnect: false })
		})
		redis = client
	}
	return redis
}

function markRedisUnavailable(
	error: unknown,
	options: { disconnect?: boolean } = {},
) {
	const now = Date.now()
	redisUnavailableUntil = now + REDIS_BACKOFF_MS

	if (now - lastRedisErrorLogAt > REDIS_BACKOFF_MS) {
		lastRedisErrorLogAt = now
		console.warn(
			'Rate-limit Redis unavailable; using in-memory fallback.',
			error instanceof Error ? error.message : 'unknown error',
		)
	}

	if (options.disconnect !== false) {
		redis?.disconnect()
		redis = null
	}
}
