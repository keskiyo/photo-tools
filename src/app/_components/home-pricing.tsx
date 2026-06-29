import { Check } from 'lucide-react'

import { AnimatedCard } from '@/components/ui/animated-card'
import { AnimatedSection } from '@/components/ui/animated-section'
import { T } from '@/localization'

import { pricingTiers } from './home-data'

export function HomePricing() {
	return (
		<AnimatedSection className='app-container py-20'>
			<div className='max-w-2xl'>
				<p className='text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
					<T k='home.tiers.eyebrow' />
				</p>
				<h2 className='mt-4 text-4xl font-bold tracking-tight md:text-5xl'>
					<T k='home.tiers.title' />
				</h2>
			</div>
			<div className='mt-10 grid gap-8 lg:grid-cols-3'>
				{pricingTiers.map((tier, index) => (
					<AnimatedCard key={tier.nameKey} delay={index * 0.1}>
						<article
							className={`h-full rounded-(--radius-card) p-7 ${
								tier.featured
									? 'app-surface-strong shadow-(--shadow-card-hover)'
									: 'app-surface'
							}`}
						>
							<p className='text-lg font-semibold'>
								<T k={tier.nameKey} />
							</p>
							<p className='mt-4 text-4xl font-bold tracking-tight'>
								<T k={tier.priceKey} />
							</p>
							<p className='mt-3 text-sm leading-6 text-(--color-app-text-secondary)'>
								<T k={tier.descriptionKey} />
							</p>
							<ul className='mt-7 space-y-3'>
								{tier.featureKeys.map(feature => (
									<li
										key={feature}
										className='flex gap-3 text-sm'
									>
										<Check
											aria-hidden='true'
											className='mt-0.5 h-4 w-4 shrink-0 text-(--color-app-success)'
										/>
										<span>
											<T k={feature} />
										</span>
									</li>
								))}
							</ul>
						</article>
					</AnimatedCard>
				))}
			</div>
		</AnimatedSection>
	)
}
