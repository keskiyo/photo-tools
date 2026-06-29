import { NextResponse } from 'next/server'
import { z } from 'zod'

import { sendEmailVerificationCode } from '@/lib/email-verification'
import { clientIpFromHeaders, rateLimiter } from '@/lib/rate-limit'

const requestSchema = z.object({
	email: z.string().trim().pipe(z.email()),
})

// Both budgets must pass: stops per-address harassment and broad IP-based spam.
const SEND_PER_EMAIL_LIMIT = 5
const SEND_PER_IP_LIMIT = 20
const SEND_RATE_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: Request) {
	const body = await request.json().catch(() => null)
	const parsed = requestSchema.safeParse(body)

	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
	}

	const email = parsed.data.email.toLowerCase()
	const ip = clientIpFromHeaders(request.headers)
	const emailLimit = rateLimiter.consume(
		`email-send:email:${email}`,
		SEND_PER_EMAIL_LIMIT,
		SEND_RATE_WINDOW_MS,
	)
	const ipLimit = rateLimiter.consume(
		`email-send:ip:${ip}`,
		SEND_PER_IP_LIMIT,
		SEND_RATE_WINDOW_MS,
	)
	if (!emailLimit.ok || !ipLimit.ok) {
		return NextResponse.json(
			{ error: 'Too many requests. Please try again later.' },
			{ status: 429 },
		)
	}

	try {
		await sendEmailVerificationCode(parsed.data.email)
	} catch {
		return NextResponse.json(
			{ error: 'Failed to send verification code.' },
			{ status: 500 },
		)
	}

	return NextResponse.json({ ok: true })
}
