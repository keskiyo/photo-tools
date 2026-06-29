import { describe, expect, it } from 'vitest'

import {
	countryToLanguage,
	detectPreferredLanguage,
	normalizeLanguage,
} from '@/lib/language'

describe('language detection', () => {
	it('keeps explicit supported language values', () => {
		expect(normalizeLanguage('ru')).toBe('ru')
		expect(normalizeLanguage('eu')).toBe('eu')
		expect(normalizeLanguage('en')).toBeNull()
	})

	it('detects Russian language from browser locale', () => {
		expect(detectPreferredLanguage({ languages: ['ru-RU', 'en-US'] })).toBe(
			'ru',
		)
	})

	it('detects Russian language from Russian time zones', () => {
		expect(detectPreferredLanguage({ timeZone: 'Asia/Barnaul' })).toBe('ru')
	})

	it('falls back to EU for other locales and time zones', () => {
		expect(
			detectPreferredLanguage({
				languages: ['en-US'],
				timeZone: 'Europe/Berlin',
			}),
		).toBe('eu')
	})

	it('maps server geo country codes to app language', () => {
		expect(countryToLanguage('RU')).toBe('ru')
		expect(countryToLanguage('ru')).toBe('ru')
		expect(countryToLanguage('DE')).toBe('eu')
		expect(countryToLanguage(null)).toBeNull()
	})
})
