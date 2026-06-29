import { randomUUID } from 'node:crypto'

import { auth } from '@/lib/auth'
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

const CODE_TTL_MINUTES = 15
const TOKEN_TTL_MINUTES = 10
const MAX_ATTEMPTS = 5
const CODE_PREFIX = 'password-reset'
const TOKEN_PREFIX = 'password-reset-token'

type VerifyResult =
	| { ok: true; token: string }
	| { ok: false; reason: 'expired' | 'invalid' | 'locked' | 'not_found' }

type ResetResult = { ok: true } | { ok: false; reason: 'expired' | 'invalid' }

/**
 * Emails a 6-digit reset code. Returns silently if the account does not exist,
 * so callers can respond identically regardless of whether the email is known.
 */
export async function sendPasswordResetCode(email: string) {
	const normalizedEmail = normalizeEmail(email)
	const user = await prisma.user.findUnique({
		where: { email: normalizedEmail },
		select: { name: true },
	})

	if (!user) {
		return
	}

	const code = generateSixDigitCode()
	const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000)

	await prisma.verification.deleteMany({
		where: { identifier: codeIdentifier(normalizedEmail) },
	})

	await prisma.verification.create({
		data: {
			id: randomUUID(),
			identifier: codeIdentifier(normalizedEmail),
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
		subject: 'PhotoTools password reset code',
		intro: 'use this code to reset your password:',
		ttlMinutes: CODE_TTL_MINUTES,
	})
}

/**
 * Verifies the 6-digit code. On success, issues a one-time reset token that the
 * client must present to `resetPasswordWithToken`, and removes the code.
 */
export async function verifyPasswordResetCode(
	email: string,
	code: string,
): Promise<VerifyResult> {
	const normalizedEmail = normalizeEmail(email)
	const verification = await prisma.verification.findFirst({
		where: { identifier: codeIdentifier(normalizedEmail) },
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

	const token = randomUUID()
	const tokenExpiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000)

	await prisma.$transaction([
		prisma.verification.deleteMany({
			where: { identifier: codeIdentifier(normalizedEmail) },
		}),
		prisma.verification.deleteMany({
			where: { identifier: tokenIdentifier(normalizedEmail) },
		}),
		prisma.verification.create({
			data: {
				id: randomUUID(),
				identifier: tokenIdentifier(normalizedEmail),
				value: JSON.stringify({
					hash: hashWithSecret(normalizedEmail, token),
					attempts: 0,
				} satisfies StoredCode),
				expiresAt: tokenExpiresAt,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		}),
	])

	return { ok: true, token }
}

/**
 * Consumes a one-time reset token and sets the new password using better-auth's
 * own hashing (so subsequent sign-in works), then revokes the user's sessions.
 */
export async function resetPasswordWithToken(
	email: string,
	token: string,
	newPassword: string,
): Promise<ResetResult> {
	const normalizedEmail = normalizeEmail(email)
	const record = await prisma.verification.findFirst({
		where: { identifier: tokenIdentifier(normalizedEmail) },
		orderBy: { createdAt: 'desc' },
	})

	if (!record) {
		return { ok: false, reason: 'invalid' }
	}

	if (record.expiresAt.getTime() < Date.now()) {
		await prisma.verification.delete({ where: { id: record.id } })
		return { ok: false, reason: 'expired' }
	}

	const stored = parseStoredCode(record.value)
	if (
		!stored ||
		!compareHashes(stored.hash, hashWithSecret(normalizedEmail, token))
	) {
		return { ok: false, reason: 'invalid' }
	}

	const user = await prisma.user.findUnique({
		where: { email: normalizedEmail },
		select: { id: true },
	})
	if (!user) {
		return { ok: false, reason: 'invalid' }
	}

	const ctx = await auth.$context
	const hashedPassword = await ctx.password.hash(newPassword)
	await ctx.internalAdapter.updatePassword(user.id, hashedPassword)
	await ctx.internalAdapter.deleteUserSessions(user.id)

	await prisma.verification.deleteMany({
		where: { identifier: tokenIdentifier(normalizedEmail) },
	})

	return { ok: true }
}

function codeIdentifier(email: string) {
	return `${CODE_PREFIX}:${email}`
}

function tokenIdentifier(email: string) {
	return `${TOKEN_PREFIX}:${email}`
}
