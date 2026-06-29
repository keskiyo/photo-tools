import { AnimatedCard } from '@/components/ui/animated-card'
import { AnimatedSection } from '@/components/ui/animated-section'
import { T } from '@/localization'

import { workflowSteps } from './home-data'

export function HomeWorkflow() {
	return (
		<AnimatedSection className='app-container py-20'>
			<div className='app-surface-strong rounded-(--radius-card) p-8 md:p-10'>
				<div className='grid gap-10 lg:grid-cols-[0.9fr_1.1fr]'>
					<div>
						<p className='text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
							<T k='home.workflow.eyebrow' />
						</p>
						<h2 className='mt-4 text-3xl font-bold tracking-tight md:text-5xl'>
							<T k='home.workflow.title' />
						</h2>
						<p className='mt-5 text-(--color-app-text-secondary)'>
							<T k='home.workflow.description' />
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
										<T k={step} />
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
