import { AnimatedCard } from '@/components/ui/animated-card'
import { AnimatedSection } from '@/components/ui/animated-section'
import { ToolCard } from '@/components/ui/tool-card'
import { T } from '@/localization'

import { homeTools } from './home-data'

export function HomeTools() {
	return (
		<AnimatedSection className='app-container py-20' id='tools'>
			<div className='max-w-2xl'>
				<p className='text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
					<T k='home.tools.eyebrow' />
				</p>
				<h2 className='mt-4 text-4xl font-bold tracking-tight md:text-5xl'>
					<T k='home.tools.title' />
				</h2>
			</div>
			<div className='mt-10 grid gap-8 md:grid-cols-3'>
				{homeTools.map((tool, index) => (
					<AnimatedCard
						key={tool.href}
						delay={index * 0.1}
						className='h-full'
					>
						<ToolCard
							href={tool.href}
							title={<T k={tool.titleKey} />}
							description={<T k={tool.descriptionKey} />}
							icon={tool.icon}
						/>
					</AnimatedCard>
				))}
			</div>
		</AnimatedSection>
	)
}
