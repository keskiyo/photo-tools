import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { AnimatedSection } from '@/components/ui/animated-section'
import { T } from '@/localization'

import { ConverterForm } from '../_components/converter-form'

export default function ConverterPage() {
	return (
		<div className='app-shell'>
			<Navbar />
			<main className='app-container min-h-screen pt-32 pb-20'>
				<AnimatedSection className='mb-10 max-w-3xl'>
					<p className='text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
						<T k='tool.converter.eyebrow' />
					</p>
					<h1 className='mt-4 text-4xl font-bold tracking-tight md:text-6xl'>
						<T k='tool.converter.title' />
					</h1>
					<p className='mt-5 text-lg leading-8 text-(--color-app-text-secondary)'>
						<T k='tool.converter.description' />
					</p>
				</AnimatedSection>
				<AnimatedSection delay={0.08}>
					<ConverterForm />
				</AnimatedSection>
			</main>
			<Footer />
		</div>
	)
}
