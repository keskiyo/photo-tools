import type { MetadataRoute } from 'next'

import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			// Keep private/authenticated + API surfaces out of the index.
			disallow: [
				'/api/',
				'/profile',
				'/login',
				'/register',
				'/verify-email',
				'/reset-password/',
			],
		},
		sitemap: `${siteUrl}/sitemap.xml`,
		host: siteUrl,
	}
}
