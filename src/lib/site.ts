import type { Metadata } from 'next'

/**
 * Canonical public origin. Prefers an explicit public URL, then the auth URL,
 * then localhost for dev. Trailing slashes are stripped.
 */
export const siteUrl = (
	process.env.NEXT_PUBLIC_SITE_URL ??
	process.env.BETTER_AUTH_URL ??
	'http://localhost:3000'
).replace(/\/+$/, '')

export const siteName = 'PhotoTools'
export const siteDescription =
	'Remove backgrounds, convert images, and generate AI visuals in one polished workspace.'
export const defaultOgImage = '/phototools-app.png'

/**
 * Builds per-page metadata with a canonical URL and matching OpenGraph/Twitter
 * cards. Locale is negotiated on the same URL (cookie/geo), so we set canonical
 * rather than hreflang alternates.
 */
export function pageMetadata({
	title,
	description,
	path,
}: {
	title: string
	description?: string
	path: string
}): Metadata {
	const url = `${siteUrl}${path}`
	return {
		title,
		...(description ? { description } : {}),
		alternates: { canonical: url },
		openGraph: {
			title,
			...(description ? { description } : {}),
			url,
			siteName,
			images: [{ url: defaultOgImage, alt: siteName }],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			...(description ? { description } : {}),
			images: [defaultOgImage],
		},
	}
}
