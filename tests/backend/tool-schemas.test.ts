import { describe, expect, it } from 'vitest'

import { converterSchema, generateRequestSchema } from '@/lib/tool-schemas'

describe('generateRequestSchema', () => {
	it('accepts a valid body and trims the prompt', () => {
		const result = generateRequestSchema.safeParse({
			prompt: '  a neon cat in the rain  ',
			style: 'cyberpunk',
			aspectRatio: '16:9',
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.prompt).toBe('a neon cat in the rain')
			expect(result.data.style).toBe('cyberpunk')
			expect(result.data.aspectRatio).toBe('16:9')
		}
	})

	it('applies defaults for missing style and aspect ratio', () => {
		const result = generateRequestSchema.safeParse({
			prompt: 'a calm mountain lake',
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.style).toBe('none')
			expect(result.data.aspectRatio).toBe('1:1')
		}
	})

	it('rejects a prompt shorter than 8 characters', () => {
		expect(
			generateRequestSchema.safeParse({ prompt: 'short' }).success,
		).toBe(false)
	})

	it('rejects an unknown style', () => {
		const result = generateRequestSchema.safeParse({
			prompt: 'a valid long prompt',
			style: 'make-a-virus',
		})
		expect(result.success).toBe(false)
	})

	it('rejects an invalid aspect ratio', () => {
		const result = generateRequestSchema.safeParse({
			prompt: 'a valid long prompt',
			aspectRatio: '3:2',
		})
		expect(result.success).toBe(false)
	})

	it('rejects a non-object body', () => {
		expect(generateRequestSchema.safeParse(null).success).toBe(false)
		expect(generateRequestSchema.safeParse('nope').success).toBe(false)
	})
})

describe('converterSchema', () => {
	it('coerces dimensions from form data strings', () => {
		const result = converterSchema.safeParse({
			format: 'webp',
			width: '1200',
			height: '800',
			preserveAspectRatio: true,
		})

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.width).toBe(1200)
			expect(result.data.height).toBe(800)
		}
	})

	it('allows empty optional dimensions', () => {
		const result = converterSchema.safeParse({
			format: 'png',
			width: '',
			height: '',
			preserveAspectRatio: false,
		})

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.width).toBe('')
			expect(result.data.height).toBe('')
		}
	})

	it('rejects unsupported output formats', () => {
		expect(
			converterSchema.safeParse({
				format: 'gif',
				width: '',
				height: '',
				preserveAspectRatio: true,
			}).success,
		).toBe(false)
	})
})
