import { NextResponse } from 'next/server'
import { z } from 'zod'

import { sendEmailVerificationCode } from '@/lib/email-verification'
import { getLanguageFromRequestHeaders } from '@/lib/language'
import { consumeEmailAndIpLimits } from '@/lib/rate-limit'

const requestSchema = z.object({
	email: z.string().trim().pipe(z.email()),
})

// Both budgets must pass: stops per-address harassment and broad IP-based spam.
const SEND_PER_EMAIL_LIMIT = 5
const SEND_PER_IP_LIMIT = 20

export async function POST(request: Request) {
	const body = await request.json().catch(() => null)
	const parsed = requestSchema.safeParse(body)

	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
	}

	const allowed = consumeEmailAndIpLimits({
		namespace: 'email-send',
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
		await sendEmailVerificationCode(
			parsed.data.email,
			getLanguageFromRequestHeaders(request.headers),
		)
	} catch {
		return NextResponse.json(
			{ error: 'Failed to send verification code.' },
			{ status: 500 },
		)
	}

	return NextResponse.json({ ok: true })
}
