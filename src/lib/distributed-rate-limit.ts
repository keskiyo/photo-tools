import IORedis from 'ioredis'

import {
	rateLimiter,
	type RateLimitResult,
} from '@/lib/rate-limit'

let redis: IORedis | null = null

export async function consumeDistributedRateLimit(
	key: string,
	limit: number,
	windowMs: number,
): Promise<RateLimitResult> {
	if (!process.env.REDIS_URL) {
		return rateLimiter.consume(key, limit, windowMs)
	}

	const client = getRedisClient()
	const redisKey = `rate-limit:${key}`
	const count = await client.incr(redisKey)
	if (count === 1) {
		await client.pexpire(redisKey, windowMs)
	}
	const ttl = await client.pttl(redisKey)
	return rateLimitResultFromCount(
		count,
		limit,
		ttl > 0 ? ttl : windowMs,
	)
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
			maxRetriesPerRequest: 1,
			lazyConnect: true,
		})
		// Without an 'error' listener ioredis throws on connection blips and can
		// crash the process; log the message and let it reconnect on its own.
		client.on('error', error => {
			console.error(
				'Rate-limit Redis error',
				error instanceof Error ? error.message : 'unknown error',
			)
		})
		redis = client
	}
	return redis
}
