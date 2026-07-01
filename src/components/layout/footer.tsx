'use client'

import { useTranslations } from 'next-intl'

import Link from 'next/link'


const links = [
	{ href: '/documents/user-agreement', labelKey: 'footer.userAgreement' },
	{ href: '/documents/privacy', labelKey: 'footer.privacyPolicy' },
] as const

export function Footer() {
	const t = useTranslations()

	return (
		<footer className="border-t border-(--color-app-border) py-12">
			<div className="app-container grid gap-8 md:grid-cols-[1.4fr_0.8fr]">
				<div>
					<p className="text-xl font-semibold">PhotoTools</p>
					<p className="mt-3 max-w-xl text-sm leading-6 text-(--color-app-text-secondary)">
						{t('footer.description')}
					</p>
				</div>
				<nav aria-label={t('footer.documents')} className="grid gap-3 text-sm">
					<p className="mb-1 text-xl font-bold text-(--color-app-text)">
						{t('footer.documents')}
					</p>
					{links.map(link => (
						<Link
							key={link.href}
							href={link.href}
							className="focus-ring w-fit rounded-(--radius-button) text-(--color-app-text-secondary) transition-colors hover:text-(--color-app-text)"
						>
							{t(link.labelKey)}
						</Link>
					))}
				</nav>
			</div>
		</footer>
	)
}
