import { afterEach, describe, expect, it, vi } from 'vitest'

import { getAllowedDownloadUrl } from '@/lib/download-source'

const ORIGIN = 'https://app.example'

describe('getAllowedDownloadUrl', () => {
	afterEach(() => {
		vi.unstubAllEnvs()
	})

	it('allows same-origin relative URLs', () => {
		expect(getAllowedDownloadUrl('/generated/image.png', ORIGIN)?.href).toBe(
			'https://app.example/generated/image.png',
		)
	})

	it('allows configured public storage URLs', () => {
		vi.stubEnv(
			'STORAGE_PUBLIC_BASE_URL',
			'https://storage.yandexcloud.net/phototools-storage',
		)

		expect(
			getAllowedDownloadUrl(
				'https://storage.yandexcloud.net/phototools-storage/generated/image.png',
				ORIGIN,
			)?.href,
		).toBe(
			'https://storage.yandexcloud.net/phototools-storage/generated/image.png',
		)
	})

	it('rejects unrelated external URLs', () => {
		expect(
			getAllowedDownloadUrl('https://example.com/file.png', ORIGIN),
		).toBeNull()
	})
})
