import { z } from 'zod'

/** True when the value is a syntactically valid email (after trim). */
export function isValidEmail(value: string | undefined) {
	return z.string().trim().pipe(z.email()).safeParse(value).success
}

/** Attaches results created before sign-in (anonymous cookie) to the account. */
export async function claimAnonymousImages() {
	await fetch('/api/processed-images/claim', {
		method: 'POST',
	})
}

/** Requests a verification code email; throws `errorMessage` on failure. */
export async function sendVerificationCode(
	email: string,
	errorMessage: string,
) {
	const response = await fetch('/api/email-verification/send', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email }),
	})

	if (!response.ok) {
		throw new Error(errorMessage)
	}
}
