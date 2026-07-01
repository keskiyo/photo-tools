import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

import {
	GEO_LANGUAGE_COOKIE,
	LEGACY_GEO_LANGUAGE_COOKIE,
	LEGACY_UI_LANGUAGE_COOKIE,
	UI_LANGUAGE_COOKIE,
} from '@/lib/app-cookies'

export const locales = ['en', 'ru'] as const
export type AppLocale = (typeof locales)[number]
export const defaultLocale: AppLocale = 'en'

/** Maps stored values to a supported locale, treating the legacy `eu` as `en`. */
function normalizeLocale(value: string | undefined): AppLocale | null {
	if (value === 'ru') return 'ru'
	if (value === 'en' || value === 'eu') return 'en'
	return null
}

async function resolveLocale(): Promise<AppLocale> {
	const cookieStore = await cookies()

	const fromCookie = normalizeLocale(
		cookieStore.get(UI_LANGUAGE_COOKIE)?.value ??
			cookieStore.get(LEGACY_UI_LANGUAGE_COOKIE)?.value,
	)
	if (fromCookie) return fromCookie

	const fromGeo = normalizeLocale(
		cookieStore.get(GEO_LANGUAGE_COOKIE)?.value ??
			cookieStore.get(LEGACY_GEO_LANGUAGE_COOKIE)?.value,
	)
	if (fromGeo) return fromGeo

	const headerStore = await headers()
	const acceptLanguage = headerStore.get('accept-language')?.toLowerCase() ?? ''
	return acceptLanguage.includes('ru') ? 'ru' : 'en'
}

export default getRequestConfig(async () => {
	const locale = await resolveLocale()
	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
	}
})
