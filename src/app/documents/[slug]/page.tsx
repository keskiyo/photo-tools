import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { legalDocuments, type LegalDocumentSlug } from '@/data/legal-documents'
import { pageMetadata } from '@/lib/site'

import { DocumentContent } from '../_components/document-content'

type PageProps = {
	params: Promise<{ slug: string }>
}

// Maps the URL slug to its localized title key in messages.documents.
const TITLE_KEY: Record<LegalDocumentSlug, 'userAgreement' | 'privacy'> = {
	'user-agreement': 'userAgreement',
	privacy: 'privacy',
}

export function generateStaticParams() {
	return Object.keys(legalDocuments).map(slug => ({ slug }))
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params
	const t = await getTranslations('documents')
	const titleKey = TITLE_KEY[slug as LegalDocumentSlug]
	return pageMetadata({
		title: titleKey ? t(titleKey) : t('fallbackTitle'),
		path: `/documents/${slug}`,
	})
}

export default async function DocumentPage({ params }: PageProps) {
	const { slug } = await params
	const document = legalDocuments[slug as LegalDocumentSlug]
	if (!document) notFound()

	const t = await getTranslations('documents')

	return (
		<div className="app-shell">
			<Navbar />
			<main className="app-container min-h-screen pt-32 pb-20">
				<p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)">
					{t('eyebrow')}
				</p>
				<h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
					{t(TITLE_KEY[slug as LegalDocumentSlug])}
				</h1>
				<section className="app-surface mt-10 rounded-(--radius-card) p-6 text-base leading-7 text-(--color-app-text-secondary) md:p-8 md:text-lg md:leading-8">
					<DocumentContent content={document.content} />
				</section>
			</main>
			<Footer />
		</div>
	)
}
