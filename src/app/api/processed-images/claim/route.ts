import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { ANONYMOUS_OWNER_COOKIE } from '@/lib/anonymous-owner'
import { LEGACY_ANONYMOUS_OWNER_COOKIE } from '@/lib/app-cookies'
import { auth } from '@/lib/auth'
import { claimAnonymousProcessedImages } from '@/lib/processed-images'

export async function POST() {
	const requestHeaders = await headers()
	const cookieStore = await cookies()
	const session = await auth.api.getSession({ headers: requestHeaders })

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const anonymousOwnerId =
		cookieStore.get(ANONYMOUS_OWNER_COOKIE)?.value ??
		cookieStore.get(LEGACY_ANONYMOUS_OWNER_COOKIE)?.value
	if (!anonymousOwnerId) {
		return NextResponse.json({ ok: true })
	}

	await claimAnonymousProcessedImages({
		anonymousOwnerId,
		userId: session.user.id,
	})

	const response = NextResponse.json({ ok: true })
	response.cookies.delete(ANONYMOUS_OWNER_COOKIE)
	response.cookies.delete(LEGACY_ANONYMOUS_OWNER_COOKIE)
	return response
}
