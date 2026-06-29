'use client'

import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import {
	LEGACY_UI_LANGUAGE_COOKIE,
	UI_LANGUAGE_COOKIE,
} from '@/lib/app-cookies'
import {
	dictionaries,
	type Locale,
	type TranslationKey,
} from '@/localization/dictionaries'

type LocalizationContextValue = {
	locale: Locale
	setLocale: (locale: Locale) => void
	t: (key: TranslationKey) => string
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null)
const LANGUAGE_STORAGE_KEY = UI_LANGUAGE_COOKIE
const LEGACY_LANGUAGE_STORAGE_KEY = LEGACY_UI_LANGUAGE_COOKIE
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function LocalizationProvider({
	children,
	initialLocale = 'eu',
}: {
	children: ReactNode
	initialLocale?: Locale
}) {
	const [locale, setLocaleState] = useState<Locale>(initialLocale)

	useEffect(() => {
		document.documentElement.lang = locale === 'ru' ? 'ru' : 'en'
	}, [locale])

	useEffect(() => {
		const legacyValue = window.localStorage.getItem(
			LEGACY_LANGUAGE_STORAGE_KEY,
		)
		if (legacyValue && !window.localStorage.getItem(LANGUAGE_STORAGE_KEY)) {
			window.localStorage.setItem(LANGUAGE_STORAGE_KEY, legacyValue)
		}
		const legacyCookieValue = getCookieValue(LEGACY_UI_LANGUAGE_COOKIE)
		if (
			(legacyCookieValue === 'ru' || legacyCookieValue === 'eu') &&
			!getCookieValue(UI_LANGUAGE_COOKIE)
		) {
			document.cookie = `${UI_LANGUAGE_COOKIE}=${legacyCookieValue}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
		}
		window.localStorage.removeItem(LEGACY_LANGUAGE_STORAGE_KEY)
		deleteCookie(LEGACY_UI_LANGUAGE_COOKIE)
	}, [])

	const value = useMemo<LocalizationContextValue>(
		() => ({
			locale,
			setLocale(nextLocale) {
				setLocaleState(nextLocale)
				window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale)
				window.localStorage.removeItem(LEGACY_LANGUAGE_STORAGE_KEY)
				document.cookie = `${UI_LANGUAGE_COOKIE}=${nextLocale}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
				deleteCookie(LEGACY_UI_LANGUAGE_COOKIE)
			},
			t(key) {
				return dictionaries[locale][key] ?? dictionaries.eu[key]
			},
		}),
		[locale],
	)

	return (
		<LocalizationContext.Provider value={value}>
			{children}
		</LocalizationContext.Provider>
	)
}

function deleteCookie(name: string) {
	document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
}

function getCookieValue(name: string) {
	const cookie = document.cookie
		.split('; ')
		.find(item => item.startsWith(`${name}=`))
	return cookie
		? decodeURIComponent(cookie.split('=').slice(1).join('='))
		: null
}

export function useLocalization() {
	const context = useContext(LocalizationContext)
	if (!context) {
		throw new Error(
			'useLocalization must be used inside LocalizationProvider',
		)
	}
	return context
}

export function T({ k }: { k: TranslationKey }) {
	const { t } = useLocalization()
	return t(k)
}
