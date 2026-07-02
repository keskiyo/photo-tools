import { NextResponse } from 'next/server'
import { z } from 'zod'

import { sendPasswordResetCode } from '@/lib/password-reset'
import { consumeEmailAndIpLimits } from '@/lib/rate-limit'

const requestSchema = z.object({
	email: z.string().trim().pipe(z.email()),
})

const SEND_PER_EMAIL_LIMIT = 5
const SEND_PER_IP_LIMIT = 20

export async function POST(request: Request) {
	const body = await request.json().catch(() => null)
	const parsed = requestSchema.safeParse(body)

	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
	}

	const allowed = consumeEmailAndIpLimits({
		namespace: 'password-reset-send',
		email: parsed.data.email,
		headers: request.headers,
		emailLimit: SEND_PER_EMAIL_LIMIT,
		ipLimit: SEND_PER_IP_LIMIT,
	})
	if (!allowed) {
		return NextResponse.json(
			{ error: 'Too many requests. Please try again later.' },
			{ status: 429 },
		)
	}

	try {
		await sendPasswordResetCode(parsed.data.email)
	} catch {
		return NextResponse.json(
			{ error: 'Failed to send reset code.' },
			{ status: 500 },
		)
	}

	// Always succeed so the response does not reveal whether the email exists.
	return NextResponse.json({ ok: true })
}
