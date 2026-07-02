import { describe, expect, it } from 'vitest'

import { createAiDownloadFileName } from '@/app/(ai-generator)/_components/ai-download-file-name'

describe('createAiDownloadFileName', () => {
	it('builds a readable AI download name from style and aspect ratio', () => {
		expect(
			createAiDownloadFileName({
				style: 'anime',
				aspectRatio: '1:1',
			}),
		).toBe('anime_style_1x1.jpg')
	})

	it('uses a generic readable name when no style is selected', () => {
		expect(
			createAiDownloadFileName({
				style: 'none',
				aspectRatio: '16:9',
			}),
		).toBe('ai_image_16x9.jpg')
	})
})
