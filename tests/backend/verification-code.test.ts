import { describe, expect, it } from 'vitest'

import {
	buildCodeEmailContent,
	compareHashes,
	escapeHtml,
	generateSixDigitCode,
	hashWithSecret,
	normalizeEmail,
	parseStoredCode,
} from '@/lib/verification-code'

describe('normalizeEmail', () => {
	it('trims and lowercases', () => {
		expect(normalizeEmail('  User@Mail.RU ')).toBe('user@mail.ru')
	})
})

describe('generateSixDigitCode', () => {
	it('always returns a 6-digit numeric string', () => {
		for (let i = 0; i < 100; i += 1) {
			const code = generateSixDigitCode()
			expect(code).toMatch(/^\d{6}$/)
			expect(Number(code)).toBeGreaterThanOrEqual(100000)
			expect(Number(code)).toBeLessThanOrEqual(999999)
		}
	})
})

describe('hashWithSecret', () => {
	it('is deterministic for the same parts', () => {
		expect(hashWithSecret('a@b.com', '123456')).toBe(
			hashWithSecret('a@b.com', '123456'),
		)
	})

	it('differs when any part changes', () => {
		expect(hashWithSecret('a@b.com', '123456')).not.toBe(
			hashWithSecret('a@b.com', '123457'),
		)
		expect(hashWithSecret('a@b.com', '123456')).not.toBe(
			hashWithSecret('c@d.com', '123456'),
		)
	})

	it('returns a hex sha256 digest', () => {
		expect(hashWithSecret('x')).toMatch(/^[0-9a-f]{64}$/)
	})
})

describe('compareHashes', () => {
	it('returns true for identical hex digests', () => {
		const hash = hashWithSecret('same')
		expect(compareHashes(hash, hash)).toBe(true)
	})

	it('returns false for different digests', () => {
		expect(compareHashes(hashWithSecret('a'), hashWithSecret('b'))).toBe(false)
	})

	it('returns false for different-length inputs', () => {
		expect(compareHashes('aa', 'aabb')).toBe(false)
	})
})

describe('parseStoredCode', () => {
	it('parses a valid stored payload', () => {
		expect(parseStoredCode('{"hash":"abc","attempts":2}')).toEqual({
			hash: 'abc',
			attempts: 2,
		})
	})

	it('returns null for malformed or wrong-shaped JSON', () => {
		expect(parseStoredCode('not json')).toBeNull()
		expect(parseStoredCode('{"hash":"abc"}')).toBeNull()
		expect(parseStoredCode('{"attempts":1}')).toBeNull()
	})
})

describe('escapeHtml', () => {
	it('escapes HTML-significant characters', () => {
		expect(escapeHtml(`<a href="x">O'Neil & co</a>`)).toBe(
			'&lt;a href=&quot;x&quot;&gt;O&#039;Neil &amp; co&lt;/a&gt;',
		)
	})
})

describe('buildCodeEmailContent', () => {
	it('builds the registration email with PhotoTools branding', () => {
		const content = buildCodeEmailContent({
			name: 'Maks',
			code: '601914',
			subject: 'PhotoTools: Подтверждение регистрации',
			intro: 'введите данный код на странице регистрации:',
			ttlMinutes: 5,
			template: 'registration',
			language: 'ru',
		})

		expect(content.text).toContain('Подтверждение регистрации')
		expect(content.text).toContain('Команда PhotoTools')
		expect(content.html).toContain('601914')
		expect(content.html).toContain('Команда')
		expect(content.html).toContain('PhotoTools')
		expect(content.html).not.toContain('Carve.Photos')
	})

	it('builds the registration email in English for EN UI', () => {
		const content = buildCodeEmailContent({
			name: 'Maks',
			code: '530577',
			subject: 'PhotoTools: Registration confirmation',
			intro: 'enter this code on the registration page:',
			ttlMinutes: 5,
			template: 'registration',
			language: 'en',
		})

		expect(content.text).toContain('Registration confirmation')
		expect(content.text).toContain('PhotoTools team')
		expect(content.html).toContain('530577')
		expect(content.html).toContain('Team')
		expect(content.html).toContain('PhotoTools')
		expect(content.html).not.toContain('Carve.Photos')
	})
})
