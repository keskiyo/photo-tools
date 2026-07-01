'use server'

import { cookies } from 'next/headers'

import { UI_LANGUAGE_COOKIE } from '@/lib/app-cookies'

import type { AppLocale } from './request'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/** Persists the user's chosen UI locale; the next request reads it server-side. */
export async function setUserLocale(locale: AppLocale) {
	const cookieStore = await cookies()
	cookieStore.set(UI_LANGUAGE_COOKIE, locale, {
		path: '/',
		maxAge: COOKIE_MAX_AGE,
		sameSite: 'lax',
	})
}
