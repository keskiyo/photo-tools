import { NextResponse } from 'next/server'
import { z } from 'zod'

import { resetPasswordWithToken } from '@/lib/password-reset'
import { clientIpFromHeaders, rateLimiter } from '@/lib/rate-limit'

const requestSchema = z.object({
	email: z.string().trim().pipe(z.email()),
	token: z.string().trim().min(1),
	password: z.string().min(8),
})

// Throttle token consumption so a stolen/guessed reset token cannot be hammered.
const ATTEMPT_LIMIT = 10
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: Request) {
	const body = await request.json().catch(() => null)
	const parsed = requestSchema.safeParse(body)

	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
	}

	const email = parsed.data.email.toLowerCase()
	const ip = clientIpFromHeaders(request.headers)
	const emailLimit = rateLimiter.consume(
		`reset-complete:email:${email}`,
		ATTEMPT_LIMIT,
		ATTEMPT_WINDOW_MS,
	)
	const ipLimit = rateLimiter.consume(
		`reset-complete:ip:${ip}`,
		ATTEMPT_LIMIT,
		ATTEMPT_WINDOW_MS,
	)
	if (!emailLimit.ok || !ipLimit.ok) {
		return NextResponse.json(
			{ error: 'Too many requests. Please try again later.' },
			{ status: 429 },
		)
	}

	const result = await resetPasswordWithToken(
		parsed.data.email,
		parsed.data.token,
		parsed.data.password,
	)

	if (!result.ok) {
		return NextResponse.json(
			{ error: result.reason },
			{ status: result.reason === 'expired' ? 410 : 400 },
		)
	}

	return NextResponse.json({ ok: true })
}
