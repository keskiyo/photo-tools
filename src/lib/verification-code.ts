import { createHash, randomInt, timingSafeEqual } from 'node:crypto'

import { Resend } from 'resend'

import { requireAuthSecret } from '@/lib/env'
import type { Language } from '@/lib/language'

/** Shape stored in the `verification` table for a one-time code/token. */
export type StoredCode = {
	hash: string
	attempts: number
}

type CodeEmailTemplate = 'default' | 'registration'

type CodeEmailContentInput = {
	name: string
	code: string
	subject: string
	intro: string
	ttlMinutes: number
	template?: CodeEmailTemplate
	language?: Language
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
	const secret = requireAuthSecret()
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
	template = 'default',
	language = 'en',
}: {
	to: string
	name: string
	code: string
	subject: string
	intro: string
	ttlMinutes: number
	template?: CodeEmailTemplate
	language?: Language
}) {
	const apiKey = process.env.RESEND_API_KEY

	if (!apiKey) {
		throw new Error('RESEND_API_KEY is not configured.')
	}

	const resend = new Resend(apiKey)

	const from =
		process.env.RESEND_FROM_EMAIL ?? 'PhotoTools <onboarding@resend.dev>'
	const content = buildCodeEmailContent({
		name,
		code,
		subject,
		intro,
		ttlMinutes,
		template,
		language,
	})

	await resend.emails.send({
		from,
		to,
		subject,
		text: content.text,
		html: content.html,
	})
}

export function buildCodeEmailContent({
	name,
	code,
	subject,
	intro,
	ttlMinutes,
	template = 'default',
	language = 'en',
}: CodeEmailContentInput) {
	if (template === 'registration') {
		return buildRegistrationEmailContent({ code, language, ttlMinutes })
	}

	return {
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
	}
}

function buildRegistrationEmailContent({
	code,
	language,
	ttlMinutes,
}: {
	code: string
	language: Language
	ttlMinutes: number
}) {
	const copy =
		language === 'ru'
			? {
					title: 'Подтверждение регистрации',
					instruction:
						'Чтобы завершить регистрацию, пожалуйста, введите данный код на странице регистрации:',
					expires: `Код действует ${ttlMinutes} минут.`,
					ignore:
						'Если вы не регистрировались на нашем сайте, пожалуйста, проигнорируйте это письмо.',
					signature: 'Команда PhotoTools',
					team: 'Команда',
				}
			: {
					title: 'Registration confirmation',
					instruction:
						'To finish registration, please enter this code on the registration page:',
					expires: `The code expires in ${ttlMinutes} minutes.`,
					ignore:
						'If you did not register on our site, please ignore this email.',
					signature: 'PhotoTools team',
					team: 'Team',
				}

	return {
		text: [
			copy.title,
			'',
			copy.instruction,
			code,
			'',
			copy.expires,
			copy.ignore,
			'',
			copy.signature,
		].join('\n'),
		html: `
			<div style="margin: 0; padding: 72px 24px; background: #ffffff; font-family: Arial, sans-serif; color: #1f2937;">
				<div style="max-width: 560px; margin: 0 auto;">
					<div style="height: 1px; background: #e5e7eb; margin: 0 0 40px;"></div>
					<h1 style="margin: 0 0 24px; font-size: 24px; line-height: 32px; font-weight: 700; color: #1f2937;">${copy.title}</h1>
					<p style="margin: 0 0 16px; font-size: 16px; line-height: 26px; color: #374151;">${copy.instruction}</p>
					<div style="margin: 0 0 22px; padding: 13px 18px; border-radius: 6px; background: #e5e7eb; text-align: center; font-family: 'Courier New', monospace; font-size: 16px; line-height: 20px; font-weight: 700; letter-spacing: 4px; color: #4b5563;">${code}</div>
					<p style="margin: 0 0 20px; font-size: 16px; line-height: 26px; color: #374151;">${copy.ignore}</p>
					<p style="margin: 0 0 62px; font-size: 16px; line-height: 24px; color: #374151;">${copy.team} <a href="#" style="color: #2563eb; text-decoration: underline;">PhotoTools</a></p>
					<p style="margin: 0; text-align: center; font-size: 13px; line-height: 20px; color: #9ca3af;">© PhotoTools</p>
				</div>
			</div>
		`,
	}
}
