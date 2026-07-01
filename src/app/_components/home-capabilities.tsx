import { getTranslations } from 'next-intl/server'

import { AnimatedCard } from '@/components/ui/animated-card'
import { AnimatedSection } from '@/components/ui/animated-section'

import { capabilities } from './home-data'

export async function HomeCapabilities() {
	const t = await getTranslations()
	return (
		<AnimatedSection className="app-container py-20">
			<div className="grid gap-8 lg:grid-cols-3">
				{capabilities.map((item, index) => (
					<AnimatedCard
						key={item.titleKey}
						delay={index * 0.1}
						className="h-full"
					>
						<div className="app-surface gradient-border h-full rounded-(--radius-card) p-7 transition duration-200 hover:-translate-y-1 hover:shadow-(--shadow-card-hover)">
							<span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-(--gradient-app-soft) text-(--color-app-accent)">
								{item.icon}
							</span>
							<h3 className="text-xl font-semibold">{t(item.titleKey)}</h3>
							<p className="mt-3 text-sm leading-6 text-(--color-app-text-secondary)">
								{t(item.descriptionKey)}
							</p>
						</div>
					</AnimatedCard>
				))}
			</div>
		</AnimatedSection>
	)
}
