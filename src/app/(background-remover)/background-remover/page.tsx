import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { AnimatedSection } from '@/components/ui/animated-section'
import { pageMetadata } from '@/lib/site'

import { BackgroundRemoverForm } from '../_components/background-remover-form'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations()
	return pageMetadata({
		title: t('tool.bg.title'),
		description: t('tool.bg.description'),
		path: '/background-remover',
	})
}

export default async function BackgroundRemoverPage() {
	const t = await getTranslations()
	return (
		<div className='app-shell'>
			<Navbar />
			<main className='app-container min-h-screen pt-32 pb-20'>
				<AnimatedSection className='mb-10 max-w-3xl'>
					<p className='text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
						{t('tool.bg.eyebrow')}
					</p>
					<h1 className='mt-4 text-4xl font-bold tracking-tight md:text-6xl'>
						{t('tool.bg.title')}
					</h1>
					<p className='mt-5 text-lg leading-8 text-(--color-app-text-secondary)'>
						{t('tool.bg.description')}
					</p>
				</AnimatedSection>
				<AnimatedSection delay={0.08}>
					<BackgroundRemoverForm />
				</AnimatedSection>
			</main>
			<Footer />
		</div>
	)
}
