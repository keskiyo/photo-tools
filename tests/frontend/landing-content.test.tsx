import { describe, expect, it } from 'vitest'

import en from '../../messages/en.json'
import ru from '../../messages/ru.json'

type Messages = { [key: string]: string | Messages }

const corruptedFragments = [
	'???',
	'\uFFFD',
	'\u043F\u0457\u0405',
	'\u0420\u045F',
	'\u0420\u0403',
	'\u0420\u040F',
	'\u0421\u0403',
	'\u0421\u201A',
	'\u0421\u201E',
	'\u0421\u2039',
	'\u0432\u201A',
]

function leafKeys(messages: Messages, prefix = ''): string[] {
	return Object.entries(messages).flatMap(([key, value]) =>
		typeof value === 'object' && value !== null
			? leafKeys(value, `${prefix}${key}.`)
			: [`${prefix}${key}`],
	)
}

function leafValues(messages: Messages): string[] {
	return Object.values(messages).flatMap(value =>
		typeof value === 'object' && value !== null ? leafValues(value) : [value],
	)
}

describe('localization messages', () => {
	it('exposes identical keys in en and ru', () => {
		expect(leafKeys(en as Messages).sort()).toEqual(
			leafKeys(ru as Messages).sort(),
		)
	})

	it('has no empty translations', () => {
		for (const value of [
			...leafValues(en as Messages),
			...leafValues(ru as Messages),
		]) {
			expect(value.trim().length).toBeGreaterThan(0)
		}
	})

	it('has no corrupted localization text', () => {
		for (const value of [
			...leafValues(en as Messages),
			...leafValues(ru as Messages),
		]) {
			for (const fragment of corruptedFragments) {
				expect(value).not.toContain(fragment)
			}
		}
	})
})
