import { ChevronDown } from 'lucide-react'

import { AnimatedCard } from '@/components/ui/animated-card'
import { AnimatedSection } from '@/components/ui/animated-section'
import { T } from '@/localization'

import { faqs } from './home-data'

export function HomeFaq() {
	return (
		<AnimatedSection className='app-container py-20'>
			<div className='mx-auto max-w-3xl'>
				<p className='text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
					<T k='home.faq.eyebrow' />
				</p>
				<h2 className='mt-4 text-4xl font-bold tracking-tight md:text-5xl'>
					<T k='home.faq.title' />
				</h2>
				<div className='mt-10 space-y-4'>
					{faqs.map((faq, index) => (
						<AnimatedCard
							key={faq.questionKey}
							delay={index * 0.08}
						>
							<details className='app-surface group rounded-(--radius-control) p-5'>
								<summary className='focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-(--radius-button) text-lg font-semibold'>
									<T k={faq.questionKey} />
									<ChevronDown
										aria-hidden='true'
										className='h-5 w-5 shrink-0 transition-transform group-open:rotate-180'
									/>
								</summary>
								<div className='faq-answer'>
									<div className='min-h-0 overflow-hidden'>
										<p className='pt-4 text-sm leading-6 text-(--color-app-text-secondary)'>
											<T k={faq.answerKey} />
										</p>
									</div>
								</div>
							</details>
						</AnimatedCard>
					))}
				</div>
			</div>
		</AnimatedSection>
	)
}
