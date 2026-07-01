import type { MetadataRoute } from 'next'

import { siteDescription, siteName } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: `${siteName} — AI image utilities`,
		short_name: siteName,
		description: siteDescription,
		start_url: '/',
		display: 'standalone',
		background_color: '#0a0a0f',
		theme_color: '#0a0a0f',
		icons: [
			// Placeholder until dedicated square PWA icons (192/512) are added.
			{ src: '/phototools-app.png', sizes: 'any', type: 'image/png' },
		],
	}
}
