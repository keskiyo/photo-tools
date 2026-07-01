import { describe, expect, it } from 'vitest'

import {
	countryToLanguage,
	detectPreferredLanguage,
	normalizeLanguage,
} from '@/lib/language'

describe('language detection', () => {
	it('normalizes supported values and migrates legacy eu→en', () => {
		expect(normalizeLanguage('ru')).toBe('ru')
		expect(normalizeLanguage('en')).toBe('en')
		expect(normalizeLanguage('eu')).toBe('en')
		expect(normalizeLanguage('xx')).toBeNull()
	})

	it('detects Russian language from browser locale', () => {
		expect(detectPreferredLanguage({ languages: ['ru-RU', 'en-US'] })).toBe(
			'ru',
		)
	})

	it('detects Russian language from Russian time zones', () => {
		expect(detectPreferredLanguage({ timeZone: 'Asia/Barnaul' })).toBe('ru')
	})

	it('falls back to English for other locales and time zones', () => {
		expect(
			detectPreferredLanguage({
				languages: ['en-US'],
				timeZone: 'Europe/Berlin',
			}),
		).toBe('en')
	})

	it('maps server geo country codes to app language', () => {
		expect(countryToLanguage('RU')).toBe('ru')
		expect(countryToLanguage('ru')).toBe('ru')
		expect(countryToLanguage('DE')).toBe('en')
		expect(countryToLanguage(null)).toBeNull()
	})
})
