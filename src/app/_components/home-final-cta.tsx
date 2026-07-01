import { getTranslations } from 'next-intl/server'

import { AnimatedSection } from '@/components/ui/animated-section'
import { ButtonLink } from '@/components/ui/button-link'

export async function HomeFinalCta() {
	const t = await getTranslations()
	return (
		<AnimatedSection className='app-container py-20'>
			<div className='overflow-hidden rounded-(--radius-card) border border-(--color-app-border-strong) bg-(--gradient-app-soft) p-8 text-center md:p-12'>
				<h2 className='mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl'>
					{t('home.final.title')}
				</h2>
				<p className='mx-auto mt-5 max-w-2xl text-lg leading-8 text-(--color-app-text-secondary)'>
					{t('home.final.description')}
				</p>
				<div className='mt-8 flex flex-col justify-center gap-4 sm:flex-row'>
					<ButtonLink href='/converter'>
						{t('home.final.convert')}
					</ButtonLink>
					<ButtonLink href='/background-remover' variant='secondary'>
						{t('home.final.bg')}
					</ButtonLink>
				</div>
			</div>
		</AnimatedSection>
	)
}
