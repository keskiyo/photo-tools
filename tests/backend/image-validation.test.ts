import { describe, expect, it } from 'vitest'

import {
	ACCEPTED_IMAGE_TYPES,
	MAX_IMAGE_SIZE,
	isSupportedImage,
	isSafeImageDimensions,
	parseOptionalInt,
	parseQuality,
} from '@/lib/image-validation'
import { backgroundRemoverSchema } from '@/lib/tool-schemas'

describe('image validation helpers', () => {
	it('accepts supported non-empty image files under the size limit', () => {
		const file = new File(['image'], 'sample.webp', { type: 'image/webp' })

		expect(ACCEPTED_IMAGE_TYPES).toContain('image/webp')
		expect(isSupportedImage(file)).toBe(true)
	})

	it('rejects unsupported images and files above the size limit', () => {
		const unsupported = new File(['text'], 'sample.txt', {
			type: 'text/plain',
		})
		const oversized = new File(
			[new Uint8Array(MAX_IMAGE_SIZE + 1)],
			'large.png',
			{
				type: 'image/png',
			},
		)

		expect(isSupportedImage(unsupported)).toBe(false)
		expect(isSupportedImage(oversized)).toBe(false)
	})

	it('parses optional dimensions and clamps quality', () => {
		expect(parseOptionalInt('1200')).toBe(1200)
		expect(parseOptionalInt('')).toBeUndefined()
		expect(parseOptionalInt('-1')).toBeUndefined()
		expect(parseQuality('150')).toBe(100)
		expect(parseQuality('0')).toBe(1)
		expect(parseQuality(null)).toBe(85)
	})

	it('rejects image dimensions that are too large for safe processing', () => {
		expect(isSafeImageDimensions(6000, 6000)).toBe(true)
		expect(isSafeImageDimensions(6001, 1000)).toBe(false)
		expect(isSafeImageDimensions(1000, 6001)).toBe(false)
		expect(isSafeImageDimensions(7000, 7000)).toBe(false)
		expect(isSafeImageDimensions(0, 1000)).toBe(false)
	})

	it('validates background remover file selection', () => {
		expect(
			backgroundRemoverSchema.safeParse({ fileName: 'portrait.png' })
				.success,
		).toBe(true)
		expect(
			backgroundRemoverSchema.safeParse({ fileName: '' }).success,
		).toBe(false)
	})
})
