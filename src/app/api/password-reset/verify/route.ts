import { NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyPasswordResetCode } from '@/lib/password-reset'
import { consumeEmailAndIpLimits } from '@/lib/rate-limit'

const requestSchema = z.object({
	email: z.string().trim().pipe(z.email()),
	code: z.string().trim().refine((value) => /^\d{6}$/.test(value)),
})

// Throttle guess attempts so the reset code cannot be brute-forced across codes.
const ATTEMPT_LIMIT = 10

export async function POST(request: Request) {
	const body = await request.json().catch(() => null)
	const parsed = requestSchema.safeParse(body)

	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Invalid verification code.' },
			{ status: 400 },
		)
	}

	const allowed = consumeEmailAndIpLimits({
		namespace: 'reset-verify',
		email: parsed.data.email,
		headers: request.headers,
		emailLimit: ATTEMPT_LIMIT,
		ipLimit: ATTEMPT_LIMIT,
	})
	if (!allowed) {
		return NextResponse.json(
			{ error: 'Too many requests. Please try again later.' },
			{ status: 429 },
		)
	}

	const result = await verifyPasswordResetCode(
		parsed.data.email,
		parsed.data.code,
	)

	if (!result.ok) {
		return NextResponse.json(
			{ error: result.reason },
			{ status: result.reason === 'locked' ? 429 : 400 },
		)
	}

	return NextResponse.json({ ok: true, token: result.token })
}
