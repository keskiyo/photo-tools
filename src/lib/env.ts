import { z } from 'zod'

/**
 * Server-only environment validation. Required secrets must be present or the
 * app is insecure/broken; optional infra vars only disable a feature when unset.
 */

const requiredSchema = z.object({
	DATABASE_URL: z.string().min(1),
	// 32+ chars keeps auth signing and OTP hashing strong.
	BETTER_AUTH_SECRET: z.string().min(32),
})

const OPTIONAL_VARS = [
	'BETTER_AUTH_URL',
	'REDIS_URL',
	'STORAGE_PUBLIC_BASE_URL',
	'S3_BUCKET',
	'S3_REGION',
	'S3_ACCESS_KEY_ID',
	'S3_SECRET_ACCESS_KEY',
	'RESEND_API_KEY',
	'RESEND_FROM_EMAIL',
	'YANDEX_GPT_API',
	'YANDEX_ID',
	'PHOTOROOM_REMOVE_BG_API',
] as const

export type ServerEnvIssues = { errors: string[]; warnings: string[] }

export function collectServerEnvIssues(): ServerEnvIssues {
	const errors: string[] = []
	const warnings: string[] = []

	const parsed = requiredSchema.safeParse(process.env)
	if (!parsed.success) {
		for (const issue of parsed.error.issues) {
			errors.push(`${issue.path.join('.')}: ${issue.message}`)
		}
	}

	for (const key of OPTIONAL_VARS) {
		if (!process.env[key]) {
			warnings.push(`${key} is not set — related feature is disabled.`)
		}
	}

	return { errors, warnings }
}

/**
 * Validates required server env. Throws in production when required vars are
 * missing so a misconfigured deploy fails at boot instead of mid-request.
 */
export function validateServerEnv({ throwOnError }: { throwOnError: boolean }) {
	const { errors, warnings } = collectServerEnvIssues()

	for (const warning of warnings) {
		console.warn(`[env] ${warning}`)
	}

	if (errors.length === 0) return

	const message = `Invalid environment configuration:\n${errors
		.map(error => `  - ${error}`)
		.join('\n')}`

	if (throwOnError) {
		throw new Error(message)
	}
	console.warn(`[env] ${message}`)
}

/**
 * Auth/OTP signing secret. Throws if missing so one-time codes are never
 * hashed with an empty (predictable) secret.
 */
export function requireAuthSecret() {
	const secret = process.env.BETTER_AUTH_SECRET
	if (!secret) {
		throw new Error('BETTER_AUTH_SECRET is not configured.')
	}
	return secret
}
