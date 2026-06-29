import { AnimatedCard } from '@/components/ui/animated-card'
import { AnimatedSection } from '@/components/ui/animated-section'
import { T } from '@/localization'

import { capabilities } from './home-data'

export function HomeCapabilities() {
	return (
		<AnimatedSection className='app-container py-20'>
			<div className='grid gap-8 lg:grid-cols-3'>
				{capabilities.map((item, index) => (
					<AnimatedCard key={item.titleKey} delay={index * 0.1}>
						<div className='app-surface rounded-(--radius-card) p-7'>
							<span className='mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-(--gradient-app-soft) text-(--color-app-accent)'>
								{item.icon}
							</span>
							<h3 className='text-xl font-semibold'>
								<T k={item.titleKey} />
							</h3>
							<p className='mt-3 text-sm leading-6 text-(--color-app-text-secondary)'>
								<T k='home.cap.description' />
							</p>
						</div>
					</AnimatedCard>
				))}
			</div>
		</AnimatedSection>
	)
}
