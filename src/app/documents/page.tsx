import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { pageMetadata } from '@/lib/site'

const documents = [
	{ href: '/documents/user-agreement', key: 'userAgreement' },
	{ href: '/documents/privacy', key: 'privacy' },
] as const

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('documents')
	return pageMetadata({ title: t('title'), path: '/documents' })
}

export default async function DocumentsPage() {
	const t = await getTranslations('documents')

	return (
		<div className="app-shell">
			<Navbar />
			<main className="app-container min-h-screen pt-32 pb-20">
				<p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)">
					{t('eyebrow')}
				</p>
				<h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
					{t('title')}
				</h1>
				<div className="mt-10 grid gap-4">
					{documents.map(document => (
						<Link
							key={document.href}
							href={document.href}
							className="focus-ring app-surface rounded-(--radius-control) p-5 text-lg font-semibold transition-colors hover:border-(--color-app-border-strong)"
						>
							{t(document.key)}
						</Link>
					))}
				</div>
			</main>
			<Footer />
		</div>
	)
}
