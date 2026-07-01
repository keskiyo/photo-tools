import { getTranslations } from 'next-intl/server'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { ButtonLink } from '@/components/ui/button-link'

export default async function NotFound() {
	const t = await getTranslations()
	return (
		<div className='app-shell'>
			<Navbar />
			<main className='app-container grid min-h-screen place-items-center pt-28 pb-20'>
				<section className='app-surface-strong mx-auto max-w-2xl rounded-(--radius-card) p-8 text-center md:p-12'>
					<p className='mt-8 text-7xl font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
						{t('notFound.eyebrow')}
					</p>
					<h1 className='mt-4 text-4xl font-bold tracking-tight md:text-6xl'>
						{t('notFound.title')}
					</h1>
					<p className='mx-auto mt-5 max-w-xl text-base leading-7 text-(--color-app-text-secondary)'>
						{t('notFound.description')}
					</p>
					<div className='mt-8 flex flex-col justify-center gap-4 sm:flex-row'>
						<ButtonLink href='/'>
							{t('notFound.home')}
						</ButtonLink>
						<ButtonLink href='/converter' variant='secondary'>
							{t('notFound.converter')}
						</ButtonLink>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	)
}
