import { randomUUID } from 'node:crypto'

import { cookies, headers } from 'next/headers'
import type { NextResponse } from 'next/server'

import {
	ANONYMOUS_OWNER_COOKIE,
	LEGACY_ANONYMOUS_OWNER_COOKIE,
} from '@/lib/app-cookies'
import { auth } from '@/lib/auth'

export { ANONYMOUS_OWNER_COOKIE } from '@/lib/app-cookies'

export type RequestOwner = {
	userId: string | null
	anonymousOwnerId: string | null
}

export function createAnonymousOwnerId() {
	return `anon_${randomUUID()}`
}

/**
 * Resolves the caller's identity WITHOUT creating a new anonymous id.
 * Use for read/ownership checks (e.g. polling a job you created).
 */
export async function readRequestOwner(): Promise<RequestOwner> {
	const [requestHeaders, cookieStore] = await Promise.all([
		headers(),
		cookies(),
	])
	const session = await auth.api.getSession({ headers: requestHeaders })
	if (session?.user?.id) {
		return { userId: session.user.id, anonymousOwnerId: null }
	}

	const anonymousOwnerId =
		cookieStore.get(ANONYMOUS_OWNER_COOKIE)?.value ??
		cookieStore.get(LEGACY_ANONYMOUS_OWNER_COOKIE)?.value ??
		null
	return { userId: null, anonymousOwnerId }
}

/**
 * Resolves the caller's identity for a write, minting an anonymous id when the
 * caller is unauthenticated and has none yet. `cookieToSet` is non-null when the
 * primary anonymous cookie must be (re)written (fresh id or legacy migration).
 */
export async function ensureRequestOwner(): Promise<{
	owner: RequestOwner
	cookieToSet: string | null
}> {
	const [requestHeaders, cookieStore] = await Promise.all([
		headers(),
		cookies(),
	])
	const session = await auth.api.getSession({ headers: requestHeaders })
	if (session?.user?.id) {
		return {
			owner: { userId: session.user.id, anonymousOwnerId: null },
			cookieToSet: null,
		}
	}

	const currentAnonymousOwnerId = cookieStore.get(
		ANONYMOUS_OWNER_COOKIE,
	)?.value
	const anonymousOwnerId =
		currentAnonymousOwnerId ??
		cookieStore.get(LEGACY_ANONYMOUS_OWNER_COOKIE)?.value ??
		createAnonymousOwnerId()

	return {
		owner: { userId: null, anonymousOwnerId },
		cookieToSet: currentAnonymousOwnerId ? null : anonymousOwnerId,
	}
}

/** Persists a freshly minted/migrated anonymous id and clears the legacy cookie. */
export function applyAnonymousOwnerCookie(
	response: NextResponse,
	cookieToSet: string | null,
) {
	if (cookieToSet) {
		response.cookies.set(ANONYMOUS_OWNER_COOKIE, cookieToSet, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 30,
			path: '/',
			sameSite: 'lax',
		})
	}
	response.cookies.delete(LEGACY_ANONYMOUS_OWNER_COOKIE)
}
