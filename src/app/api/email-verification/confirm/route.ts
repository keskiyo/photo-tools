import { NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyEmailCode } from '@/lib/email-verification'
import { clientIpFromHeaders, rateLimiter } from '@/lib/rate-limit'

const requestSchema = z.object({
	email: z.string().trim().pipe(z.email()),
	code: z.string().trim().refine((value) => /^\d{6}$/.test(value)),
})

// Throttle guess attempts so a 6-digit code cannot be brute-forced across codes.
const ATTEMPT_LIMIT = 10
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: Request) {
	const body = await request.json().catch(() => null)
	const parsed = requestSchema.safeParse(body)

	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Invalid verification code.' },
			{ status: 400 },
		)
	}

	const email = parsed.data.email.toLowerCase()
	const ip = clientIpFromHeaders(request.headers)
	const emailLimit = rateLimiter.consume(
		`email-confirm:email:${email}`,
		ATTEMPT_LIMIT,
		ATTEMPT_WINDOW_MS,
	)
	const ipLimit = rateLimiter.consume(
		`email-confirm:ip:${ip}`,
		ATTEMPT_LIMIT,
		ATTEMPT_WINDOW_MS,
	)
	if (!emailLimit.ok || !ipLimit.ok) {
		return NextResponse.json(
			{ error: 'Too many requests. Please try again later.' },
			{ status: 429 },
		)
	}

	const result = await verifyEmailCode(parsed.data.email, parsed.data.code)

	if (!result.ok) {
		return NextResponse.json(
			{ error: result.reason },
			{ status: result.reason === 'locked' ? 429 : 400 },
		)
	}

	return NextResponse.json({ ok: true })
}
