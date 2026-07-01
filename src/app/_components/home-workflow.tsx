import { getTranslations } from 'next-intl/server'

import { AnimatedCard } from '@/components/ui/animated-card'
import { AnimatedSection } from '@/components/ui/animated-section'

import { workflowSteps } from './home-data'

export async function HomeWorkflow() {
	const t = await getTranslations()
	return (
		<AnimatedSection className='app-container py-20'>
			<div className='app-surface-strong rounded-(--radius-card) p-8 md:p-10'>
				<div className='grid gap-10 lg:grid-cols-[0.9fr_1.1fr]'>
					<div>
						<p className='text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
							{t('home.workflow.eyebrow')}
						</p>
						<h2 className='mt-4 text-3xl font-bold tracking-tight md:text-5xl'>
							{t('home.workflow.title')}
						</h2>
						<p className='mt-5 text-(--color-app-text-secondary)'>
							{t('home.workflow.description')}
						</p>
					</div>
					<div className='grid gap-4 sm:grid-cols-2'>
						{workflowSteps.map((step, index) => (
							<AnimatedCard key={step} delay={index * 0.08}>
								<div className='app-subtle-fill rounded-(--radius-control) border border-(--color-app-border) p-5'>
									<span className='gradient-text text-sm font-bold'>
										0{index + 1}
									</span>
									<p className='mt-4 text-lg font-semibold'>
										{t(step)}
									</p>
								</div>
							</AnimatedCard>
						))}
					</div>
				</div>
			</div>
		</AnimatedSection>
	)
}
