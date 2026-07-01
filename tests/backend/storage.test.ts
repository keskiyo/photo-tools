import { describe, expect, it } from 'vitest'

import {
	buildStorageKey,
	getPublicStorageUrl,
	resolveStorageMode,
} from '@/lib/storage'

describe('storage helpers', () => {
	it('builds safe generated file keys by type and extension', () => {
		const key = buildStorageKey({
			kind: 'generated',
			type: 'convert',
			extension: 'WEBP',
			now: 123,
			id: 'abc-123',
		})

		expect(key).toBe('generated/convert/123-abc-123.webp')
	})

	it('strips unsafe extension characters', () => {
		const key = buildStorageKey({
			kind: 'uploads',
			type: 'bg_remove',
			extension: '../png',
			now: 123,
			id: 'id',
		})

		expect(key).toBe('uploads/bg_remove/123-id.png')
	})

	it('returns a local public path when no public base url is configured', () => {
		expect(getPublicStorageUrl('generated/convert/x.webp')).toBe(
			'/generated/convert/x.webp',
		)
	})

	it('returns an absolute url when a public base url is configured', () => {
		expect(
			getPublicStorageUrl(
				'generated/convert/x.webp',
				'https://cdn.example.com/assets/',
			),
		).toBe('https://cdn.example.com/assets/generated/convert/x.webp')
	})

	it('uses s3 mode only when all required s3 variables are configured', () => {
		expect(
			resolveStorageMode({
				S3_BUCKET: 'bucket',
				S3_REGION: 'ru-central1',
				S3_ACCESS_KEY_ID: 'key',
				S3_SECRET_ACCESS_KEY: 'secret',
			}),
		).toBe('s3')
		expect(resolveStorageMode({ S3_BUCKET: 'bucket' })).toBe('local')
	})
})
