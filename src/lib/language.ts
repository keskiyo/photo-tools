import {
	GEO_LANGUAGE_COOKIE,
	LEGACY_GEO_LANGUAGE_COOKIE,
	LEGACY_UI_LANGUAGE_COOKIE,
	UI_LANGUAGE_COOKIE,
} from '@/lib/app-cookies'

export type Language = 'ru' | 'en'

const RUSSIAN_TIME_ZONES = new Set([
	'Europe/Kaliningrad',
	'Europe/Moscow',
	'Europe/Kirov',
	'Europe/Samara',
	'Asia/Yekaterinburg',
	'Asia/Omsk',
	'Asia/Novosibirsk',
	'Asia/Barnaul',
	'Asia/Tomsk',
	'Asia/Krasnoyarsk',
	'Asia/Irkutsk',
	'Asia/Yakutsk',
	'Asia/Vladivostok',
	'Asia/Magadan',
	'Asia/Sakhalin',
	'Asia/Kamchatka',
	'Asia/Anadyr',
])

export function normalizeLanguage(
	value: string | null | undefined,
): Language | null {
	if (value === 'ru') return 'ru'
	// Accept the new `en` and migrate the legacy `eu` value.
	if (value === 'en' || value === 'eu') return 'en'
	return null
}

export function countryToLanguage(
	country: string | null | undefined,
): Language | null {
	if (!country) return null
	return country.toUpperCase() === 'RU' ? 'ru' : 'en'
}

export function detectPreferredLanguage({
	languages,
	timeZone,
}: {
	languages?: readonly string[]
	timeZone?: string
}): Language {
	if (languages?.some(language => language.toLowerCase().startsWith('ru'))) {
		return 'ru'
	}

	if (timeZone && RUSSIAN_TIME_ZONES.has(timeZone)) {
		return 'ru'
	}

	return 'en'
}

export function getBrowserPreferredLanguage(): Language {
	if (typeof window === 'undefined') return 'en'

	const storedLanguage = normalizeLanguage(
		window.localStorage.getItem(UI_LANGUAGE_COOKIE) ??
			window.localStorage.getItem(LEGACY_UI_LANGUAGE_COOKIE),
	)
	if (storedLanguage) return storedLanguage

	const geoLanguage = normalizeLanguage(
		getCookieValue(GEO_LANGUAGE_COOKIE) ??
			getCookieValue(LEGACY_GEO_LANGUAGE_COOKIE),
	)
	if (geoLanguage) return geoLanguage

	return detectPreferredLanguage({
		languages: window.navigator.languages,
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	})
}

export function getLanguageFromRequestHeaders(
	headers: Pick<Headers, 'get'>,
): Language {
	const cookieHeader = headers.get('cookie') ?? ''
	const fromCookie = normalizeLanguage(
		getCookieHeaderValue(cookieHeader, UI_LANGUAGE_COOKIE) ??
			getCookieHeaderValue(cookieHeader, LEGACY_UI_LANGUAGE_COOKIE),
	)
	if (fromCookie) return fromCookie

	const fromGeo = normalizeLanguage(
		getCookieHeaderValue(cookieHeader, GEO_LANGUAGE_COOKIE) ??
			getCookieHeaderValue(cookieHeader, LEGACY_GEO_LANGUAGE_COOKIE),
	)
	if (fromGeo) return fromGeo

	const acceptLanguage = headers.get('accept-language')?.toLowerCase() ?? ''
	return acceptLanguage.includes('ru') ? 'ru' : 'en'
}

function getCookieValue(name: string) {
	const cookie = document.cookie
		.split('; ')
		.find(item => item.startsWith(`${name}=`))
	return cookie
		? decodeURIComponent(cookie.split('=').slice(1).join('='))
		: null
}

function getCookieHeaderValue(cookieHeader: string, name: string) {
	const item = cookieHeader
		.split('; ')
		.find(cookieItem => cookieItem.startsWith(`${name}=`))

	if (!item) return null

	return decodeURIComponent(item.split('=').slice(1).join('='))
}
