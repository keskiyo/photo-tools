import { describe, expect, it } from 'vitest'

import { getDownloadFileName } from '@/lib/download'

describe('getDownloadFileName', () => {
	it('extracts the file name from a path', () => {
		expect(getDownloadFileName('/generated/ai_gen-123.jpg')).toBe(
			'ai_gen-123.jpg',
		)
	})

	it('strips a query string', () => {
		expect(getDownloadFileName('/generated/x.png?v=2')).toBe('x.png')
	})

	it('uses the default fallback for empty or directory-only urls', () => {
		expect(getDownloadFileName('')).toBe('phototools-result')
		expect(getDownloadFileName('/')).toBe('phototools-result')
	})

	it('accepts a custom fallback', () => {
		expect(getDownloadFileName('/', 'background-result.png')).toBe(
			'background-result.png',
		)
	})
})
