import type { MetadataRoute } from 'next'

import { legalDocuments } from '@/data/legal-documents'
import { siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date()

	const primaryRoutes: MetadataRoute.Sitemap = [
		{ path: '', priority: 1, changeFrequency: 'weekly' as const },
		{
			path: '/background-remover',
			priority: 0.9,
			changeFrequency: 'weekly' as const,
		},
		{ path: '/converter', priority: 0.9, changeFrequency: 'weekly' as const },
		{
			path: '/ai-generator',
			priority: 0.9,
			changeFrequency: 'weekly' as const,
		},
		{ path: '/documents', priority: 0.4, changeFrequency: 'yearly' as const },
	].map(({ path, priority, changeFrequency }) => ({
		url: `${siteUrl}${path}`,
		lastModified: now,
		changeFrequency,
		priority,
	}))

	const documentRoutes: MetadataRoute.Sitemap = Object.keys(legalDocuments).map(
		slug => ({
			url: `${siteUrl}/documents/${slug}`,
			lastModified: now,
			changeFrequency: 'yearly',
			priority: 0.3,
		}),
	)

	return [...primaryRoutes, ...documentRoutes]
}
