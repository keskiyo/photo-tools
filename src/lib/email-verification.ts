import { randomUUID } from 'node:crypto'

import { prisma } from '@/lib/prisma'
import {
	compareHashes,
	generateSixDigitCode,
	hashWithSecret,
	normalizeEmail,
	parseStoredCode,
	sendCodeEmail,
	type StoredCode,
} from '@/lib/verification-code'

const CODE_TTL_MINUTES = 5
const MAX_ATTEMPTS = 3
const VERIFICATION_PREFIX = 'email-verification'

type VerifyEmailCodeResult =
	| { ok: true }
	| { ok: false; reason: 'expired' | 'invalid' | 'locked' | 'not_found' }

export async function sendEmailVerificationCode(email: string) {
	const normalizedEmail = normalizeEmail(email)
	const user = await prisma.user.findUnique({
		where: { email: normalizedEmail },
		select: { email: true, emailVerified: true, name: true },
	})

	if (!user || user.emailVerified) {
		return
	}

	const code = generateSixDigitCode()
	const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000)

	await prisma.verification.deleteMany({
		where: { identifier: getVerificationIdentifier(normalizedEmail) },
	})

	await prisma.verification.create({
		data: {
			id: randomUUID(),
			identifier: getVerificationIdentifier(normalizedEmail),
			value: JSON.stringify({
				hash: hashWithSecret(normalizedEmail, code),
				attempts: 0,
			} satisfies StoredCode),
			expiresAt,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	})

	await sendCodeEmail({
		to: normalizedEmail,
		name: user.name,
		code,
		subject: 'PhotoTools email verification code',
		intro: 'enter this code to verify your email:',
		ttlMinutes: CODE_TTL_MINUTES,
	})
}

export async function verifyEmailCode(
	email: string,
	code: string,
): Promise<VerifyEmailCodeResult> {
	const normalizedEmail = normalizeEmail(email)
	const verification = await prisma.verification.findFirst({
		where: { identifier: getVerificationIdentifier(normalizedEmail) },
		orderBy: { createdAt: 'desc' },
	})

	if (!verification) {
		return { ok: false, reason: 'not_found' }
	}

	if (verification.expiresAt.getTime() < Date.now()) {
		await prisma.verification.delete({ where: { id: verification.id } })
		return { ok: false, reason: 'expired' }
	}

	const stored = parseStoredCode(verification.value)
	if (!stored || stored.attempts >= MAX_ATTEMPTS) {
		return { ok: false, reason: 'locked' }
	}

	const isValid = compareHashes(
		stored.hash,
		hashWithSecret(normalizedEmail, code),
	)
	if (!isValid) {
		await prisma.verification.update({
			where: { id: verification.id },
			data: {
				value: JSON.stringify({
					...stored,
					attempts: stored.attempts + 1,
				} satisfies StoredCode),
				updatedAt: new Date(),
			},
		})
		return { ok: false, reason: 'invalid' }
	}

	await prisma.$transaction([
		prisma.user.update({
			where: { email: normalizedEmail },
			data: {
				emailVerified: true,
				updatedAt: new Date(),
			},
		}),
		prisma.verification.deleteMany({
			where: { identifier: getVerificationIdentifier(normalizedEmail) },
		}),
	])

	return { ok: true }
}

function getVerificationIdentifier(email: string) {
	return `${VERIFICATION_PREFIX}:${email}`
}
