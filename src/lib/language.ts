import {
	GEO_LANGUAGE_COOKIE,
	LEGACY_GEO_LANGUAGE_COOKIE,
	LEGACY_UI_LANGUAGE_COOKIE,
	UI_LANGUAGE_COOKIE,
} from '@/lib/app-cookies'

export type Language = 'ru' | 'eu'

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
	return value === 'ru' || value === 'eu' ? value : null
}

export function countryToLanguage(
	country: string | null | undefined,
): Language | null {
	if (!country) return null
	return country.toUpperCase() === 'RU' ? 'ru' : 'eu'
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

	return 'eu'
}

export function getBrowserPreferredLanguage(): Language {
	if (typeof window === 'undefined') return 'eu'

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

function getCookieValue(name: string) {
	const cookie = document.cookie
		.split('; ')
		.find(item => item.startsWith(`${name}=`))
	return cookie
		? decodeURIComponent(cookie.split('=').slice(1).join('='))
		: null
}
