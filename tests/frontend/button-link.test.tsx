import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ButtonLink } from '@/components/ui/button-link'

describe('ButtonLink', () => {
	it('renders a primary app link', () => {
		const html = renderToStaticMarkup(
			<ButtonLink href='/converter'>Convert image</ButtonLink>,
		)

		expect(html).toContain('href="/converter"')
		expect(html).toContain('Convert image')
		expect(html).toContain('gradient-button')
	})

	it('renders the secondary variant without the gradient button class', () => {
		const html = renderToStaticMarkup(
			<ButtonLink href='/ai-generator' variant='secondary'>
				Generate
			</ButtonLink>,
		)

		expect(html).toContain('href="/ai-generator"')
		expect(html).toContain('Generate')
		expect(html).not.toContain('gradient-button')
	})
})
