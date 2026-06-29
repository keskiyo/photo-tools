/**
 * Lightweight fixed-window rate limiter.
 *
 * In-memory only (per server instance). This is enough to stop casual abuse
 * and quota drain; swap `createRateLimiter` for a Redis/Upstash-backed store
 * when running multiple instances. The pure `consume` core takes an injectable
 * `now` so it can be unit-tested without timers.
 */

export type RateLimitResult = {
	ok: boolean
	limit: number
	remaining: number
	retryAfterMs: number
}

export type RateLimiter = {
	/** Checks-and-increments in one step (use when every attempt should count). */
	consume: (
		key: string,
		limit: number,
		windowMs: number,
		now?: number,
	) => RateLimitResult
	/** Checks the budget WITHOUT incrementing (use to gate before doing work). */
	peek: (
		key: string,
		limit: number,
		windowMs: number,
		now?: number,
	) => RateLimitResult
	/** Increments the count for a key (use only after a successful result). */
	record: (key: string, windowMs: number, now?: number) => void
	reset: (key?: string) => void
}

type Window = {
	count: number
	resetAt: number
}

export function createRateLimiter(): RateLimiter {
	const store = new Map<string, Window>()

	return {
		consume(key, limit, windowMs, now = Date.now()) {
			const existing = store.get(key)

			if (!existing || now >= existing.resetAt) {
				const resetAt = now + windowMs
				store.set(key, { count: 1, resetAt })
				return {
					ok: limit >= 1,
					limit,
					remaining: Math.max(0, limit - 1),
					retryAfterMs: limit >= 1 ? 0 : resetAt - now,
				}
			}

			existing.count += 1
			const ok = existing.count <= limit
			return {
				ok,
				limit,
				remaining: Math.max(0, limit - existing.count),
				retryAfterMs: ok ? 0 : existing.resetAt - now,
			}
		},
		peek(key, limit, windowMs, now = Date.now()) {
			const existing = store.get(key)
			const count =
				!existing || now >= existing.resetAt ? 0 : existing.count
			const ok = count < limit
			return {
				ok,
				limit,
				remaining: Math.max(0, limit - count),
				retryAfterMs: ok || !existing ? 0 : existing.resetAt - now,
			}
		},
		record(key, windowMs, now = Date.now()) {
			const existing = store.get(key)
			if (!existing || now >= existing.resetAt) {
				store.set(key, { count: 1, resetAt: now + windowMs })
				return
			}
			existing.count += 1
		},
		reset(key) {
			if (key === undefined) {
				store.clear()
				return
			}
			store.delete(key)
		},
	}
}

/** Shared limiter used by API route handlers. */
export const rateLimiter = createRateLimiter()

const CLIENT_IP_HEADERS = [
	'x-forwarded-for',
	'x-real-ip',
	'cf-connecting-ip',
	'x-vercel-forwarded-for',
]

/** Best-effort client IP from proxy headers; falls back to "unknown". */
export function clientIpFromHeaders(headers: Headers): string {
	for (const header of CLIENT_IP_HEADERS) {
		const value = headers.get(header)
		if (value) {
			// x-forwarded-for may be a comma-separated list; first entry is the client.
			return value.split(',')[0]!.trim()
		}
	}
	return 'unknown'
}

/**
 * Builds a rate-limit key for a route: prefers the signed-in user, else IP.
 * `namespace` keeps different endpoints from sharing a budget.
 */
export function resolveRateKey(
	namespace: string,
	headers: Headers,
	sessionUserId?: string | null,
): string {
	if (sessionUserId) {
		return `${namespace}:user:${sessionUserId}`
	}
	return `${namespace}:ip:${clientIpFromHeaders(headers)}`
}
