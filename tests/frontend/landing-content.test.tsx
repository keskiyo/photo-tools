import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import Home from '@/app/page'
import { LocalizationProvider } from '@/localization'

describe('landing page content', () => {
	it('renders the design-required landing sections', () => {
		const html = renderToStaticMarkup(
			<LocalizationProvider>
				<Home />
			</LocalizationProvider>,
		)

		expect(html).toContain('Usage tiers')
		expect(html).toContain('FAQ')
		expect(html).toContain('Start with the image task in front of you.')
	})
})
