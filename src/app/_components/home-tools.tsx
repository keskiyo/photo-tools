import { getTranslations } from 'next-intl/server'

import { AnimatedCard } from '@/components/ui/animated-card'
import { AnimatedSection } from '@/components/ui/animated-section'
import { ToolCard } from '@/components/ui/tool-card'

import { homeTools } from './home-data'

export async function HomeTools() {
	const t = await getTranslations()
	return (
		<AnimatedSection className="app-container py-20" id="tools">
			<div className="mx-auto max-w-3xl text-center">
				<p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)">
					{t('home.tools.eyebrow')}
				</p>
				<h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
					{t('home.tools.title')}
				</h2>
			</div>
			<div className="mt-10 grid gap-8 md:grid-cols-3">
				{homeTools.map((tool, index) => (
					<AnimatedCard key={tool.href} delay={index * 0.1} className="h-full">
						<ToolCard
							href={tool.href}
							title={t(tool.titleKey)}
							description={t(tool.descriptionKey)}
							icon={tool.icon}
						/>
					</AnimatedCard>
				))}
			</div>
		</AnimatedSection>
	)
}
