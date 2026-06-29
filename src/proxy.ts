import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
	GEO_LANGUAGE_COOKIE,
	LEGACY_GEO_LANGUAGE_COOKIE,
} from '@/lib/app-cookies'
import { countryToLanguage } from '@/lib/language'

const COUNTRY_HEADERS = [
	'x-vercel-ip-country',
	'cf-ipcountry',
	'x-country',
	'cloudfront-viewer-country',
]

const PROTECTED_PATHS = ['/profile']

export function proxy(request: NextRequest) {
	const protectedResponse = protectRoutes(request)
	if (protectedResponse) {
		return protectedResponse
	}

	const response = NextResponse.next()
	const country = getCountryFromHeaders(request)
	const language = countryToLanguage(country)

	if (language) {
		response.cookies.set(GEO_LANGUAGE_COOKIE, language, {
			maxAge: 60 * 60 * 24 * 30,
			path: '/',
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
		})
	}

	response.cookies.delete(LEGACY_GEO_LANGUAGE_COOKIE)

	return response
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|generated).*)'],
}

function protectRoutes(request: NextRequest) {
	const pathname = request.nextUrl.pathname
	const isProtectedPath = PROTECTED_PATHS.some(path =>
		pathname.startsWith(path),
	)

	if (!isProtectedPath) {
		return null
	}

	const sessionCookie =
		request.cookies.get('__Secure-better-auth.session_token') ||
		request.cookies.get('better-auth.session_token') ||
		request.cookies.get('session')

	if (!sessionCookie) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	return null
}

function getCountryFromHeaders(request: NextRequest) {
	for (const header of COUNTRY_HEADERS) {
		const value = request.headers.get(header)
		if (value) {
			return value.toUpperCase()
		}
	}

	return null
}
