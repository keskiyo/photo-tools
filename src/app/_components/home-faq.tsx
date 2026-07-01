'use client'

import { useTranslations } from 'next-intl'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { AnimatedCard } from '@/components/ui/animated-card'
import { AnimatedSection } from '@/components/ui/animated-section'

import { faqs } from './home-data'

export function HomeFaq() {
	const t = useTranslations()
	const [openItems, setOpenItems] = useState<Set<number>>(new Set())

	const toggleItem = (index: number) => {
		setOpenItems(current => {
			const next = new Set(current)

			if (next.has(index)) {
				next.delete(index)
			} else {
				next.add(index)
			}

			return next
		})
	}

	return (
		<AnimatedSection id="faq" className="app-container py-20">
			<div className="mx-auto max-w-4xl">
				<p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)">
					{t('home.faq.eyebrow')}
				</p>
				<h2 className="mt-4 text-center text-4xl font-bold tracking-tight md:text-5xl">
					{t('home.faq.title')}
				</h2>
				<div className="mt-10 space-y-5">
					{faqs.map((faq, index) => {
						const isOpen = openItems.has(index)
						const answerId = `home-faq-answer-${index}`

						return (
							<AnimatedCard key={faq.questionKey} delay={index * 0.08}>
								<article className="app-surface-strong rounded-(--radius-card) p-3">
									<button
										aria-controls={answerId}
										aria-expanded={isOpen}
										className="focus-ring app-subtle-fill flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 rounded-[calc(var(--radius-card)-8px)] px-5 text-left text-lg font-bold md:px-7 md:text-2xl"
										type="button"
										onClick={() => toggleItem(index)}
									>
										<span>{t(faq.questionKey)}</span>
										<ChevronDown
											aria-hidden="true"
											className={`h-5 w-5 shrink-0 text-(--color-app-text-secondary) transition-transform duration-300 ${
												isOpen ? 'rotate-180' : 'rotate-0'
											}`}
										/>
									</button>
									<div
										id={answerId}
										className={`grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${
											isOpen
												? 'grid-rows-[1fr] translate-y-0 opacity-100'
												: 'grid-rows-[0fr] -translate-y-1 opacity-0'
										}`}
									>
										<div className="min-h-0 overflow-hidden">
											<p className="px-2 pt-5 pb-3 text-base leading-7 text-(--color-app-text-secondary) md:px-5 md:text-lg">
												{t(faq.answerKey)}
											</p>
										</div>
									</div>
								</article>
							</AnimatedCard>
						)
					})}
				</div>
			</div>
		</AnimatedSection>
	)
}
