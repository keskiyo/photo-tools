/**
 * Runs once at server startup. Fails fast in production when required env vars
 * are missing so a misconfigured deploy never serves insecure requests.
 */
export async function register() {
	if (process.env.NEXT_RUNTIME !== 'nodejs') return

	const { validateServerEnv } = await import('@/lib/env')
	validateServerEnv({ throwOnError: process.env.NODE_ENV === 'production' })
}
