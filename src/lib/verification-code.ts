import { createHash, randomInt, timingSafeEqual } from 'node:crypto'

import { Resend } from 'resend'

/** Shape stored in the `verification` table for a one-time code/token. */
export type StoredCode = {
	hash: string
	attempts: number
}

export function normalizeEmail(email: string) {
	return email.trim().toLowerCase()
}

/** Six-digit numeric code as a string, e.g. "048213". */
export function generateSixDigitCode() {
	return String(randomInt(100000, 1000000))
}

/**
 * Hashes the given parts together with BETTER_AUTH_SECRET (sha256, hex).
 * Used to store codes/tokens without keeping the plaintext.
 */
export function hashWithSecret(...parts: string[]) {
	const secret = process.env.BETTER_AUTH_SECRET ?? ''
	return createHash('sha256')
		.update([...parts, secret].join(':'))
		.digest('hex')
}

/** Constant-time comparison of two hex digests. */
export function compareHashes(left: string, right: string) {
	const leftBuffer = Buffer.from(left, 'hex')
	const rightBuffer = Buffer.from(right, 'hex')

	if (leftBuffer.length !== rightBuffer.length) {
		return false
	}

	return timingSafeEqual(leftBuffer, rightBuffer)
}

export function parseStoredCode(value: string): StoredCode | null {
	try {
		const parsed = JSON.parse(value) as Partial<StoredCode>
		if (
			typeof parsed.hash !== 'string' ||
			typeof parsed.attempts !== 'number'
		) {
			return null
		}
		return parsed as StoredCode
	} catch {
		return null
	}
}

export function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;')
}

/** Sends a transactional email containing a one-time code via Resend. */
export async function sendCodeEmail({
	to,
	name,
	code,
	subject,
	intro,
	ttlMinutes,
}: {
	to: string
	name: string
	code: string
	subject: string
	intro: string
	ttlMinutes: number
}) {
	const apiKey = process.env.RESEND_API_KEY

	if (!apiKey) {
		throw new Error('RESEND_API_KEY is not configured.')
	}

	const resend = new Resend(apiKey)

	const from =
		process.env.RESEND_FROM_EMAIL ?? 'PhotoTools <onboarding@resend.dev>'

	await resend.emails.send({
		from,
		to,
		subject,
		text: `Hi ${name}, ${intro} ${code}. It expires in ${ttlMinutes} minutes.`,
		html: `
      <div style="font-family: Arial, sans-serif; color: #111827;">
        <h1 style="margin: 0 0 16px;">${escapeHtml(subject)}</h1>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(name)}, ${escapeHtml(intro)}</p>
        <div style="display: inline-block; padding: 14px 18px; border-radius: 12px; background: #f3f4f6; font-size: 28px; font-weight: 700; letter-spacing: 6px;">
          ${code}
        </div>
        <p style="margin: 16px 0 0; color: #4b5563;">The code expires in ${ttlMinutes} minutes.</p>
      </div>
    `,
	})
}
