import { AnimatedSection } from '@/components/ui/animated-section'
import { ButtonLink } from '@/components/ui/button-link'
import { T } from '@/localization'

export function HomeFinalCta() {
	return (
		<AnimatedSection className='app-container py-20'>
			<div className='overflow-hidden rounded-(--radius-card) border border-(--color-app-border-strong) bg-(--gradient-app-soft) p-8 text-center md:p-12'>
				<h2 className='mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl'>
					<T k='home.final.title' />
				</h2>
				<p className='mx-auto mt-5 max-w-2xl text-lg leading-8 text-(--color-app-text-secondary)'>
					<T k='home.final.description' />
				</p>
				<div className='mt-8 flex flex-col justify-center gap-4 sm:flex-row'>
					<ButtonLink href='/converter'>
						<T k='home.final.convert' />
					</ButtonLink>
					<ButtonLink href='/background-remover' variant='secondary'>
						<T k='home.final.bg' />
					</ButtonLink>
				</div>
			</div>
		</AnimatedSection>
	)
}
