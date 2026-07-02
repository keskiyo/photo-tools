import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { sendEmailVerificationCode } from '@/lib/email-verification'
import { getLanguageFromRequestHeaders } from '@/lib/language'
import { prisma } from '@/lib/prisma'

const profileSchema = z.object({
	name: z.string().trim().min(2),
	email: z.string().trim().pipe(z.email()),
})

export async function PATCH(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
	}

	const body = await request.json().catch(() => null)
	const parsed = profileSchema.safeParse(body)

	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid profile.' }, { status: 400 })
	}

	const nextEmail = parsed.data.email.toLowerCase()
	const isEmailChanged = nextEmail !== session.user.email.toLowerCase()

	if (isEmailChanged) {
		const existingUser = await prisma.user.findUnique({
			where: { email: nextEmail },
			select: { id: true },
		})

		if (existingUser && existingUser.id !== session.user.id) {
			return NextResponse.json(
				{ error: 'Email is already used.' },
				{ status: 409 },
			)
		}
	}

	await prisma.user.update({
		where: { id: session.user.id },
		data: {
			name: parsed.data.name,
			email: nextEmail,
			emailVerified: isEmailChanged ? false : session.user.emailVerified,
			updatedAt: new Date(),
		},
	})

	if (isEmailChanged) {
		await sendEmailVerificationCode(
			nextEmail,
			getLanguageFromRequestHeaders(request.headers),
		)
	}

	return NextResponse.json({
		ok: true,
		emailVerificationRequired: isEmailChanged,
		email: nextEmail,
		name: parsed.data.name,
	})
}
