import { cookies, headers } from 'next/headers'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { AnimatedSection } from '@/components/ui/animated-section'
import { ANONYMOUS_OWNER_COOKIE } from '@/lib/anonymous-owner'
import { LEGACY_ANONYMOUS_OWNER_COOKIE } from '@/lib/app-cookies'
import { auth } from '@/lib/auth'
import { getRecentProcessedImages } from '@/lib/processed-images'
import { T } from '@/localization'

import { AiGallery } from '../_components/ai-gallery'
import { AiGeneratorForm } from '../_components/ai-generator-form'

export default async function AiGeneratorPage() {
	const requestHeaders = await headers()
	const cookieStore = await cookies()
	const session = await auth.api.getSession({ headers: requestHeaders })
	const images = await getRecentProcessedImages('ai_gen', 10, {
		userId: session?.user?.id,
		anonymousOwnerId:
			cookieStore.get(ANONYMOUS_OWNER_COOKIE)?.value ??
			cookieStore.get(LEGACY_ANONYMOUS_OWNER_COOKIE)?.value,
	})

	return (
		<div className='app-shell'>
			<Navbar />
			<main className='app-container min-h-screen pt-32 pb-20'>
				<AnimatedSection className='mb-10 max-w-3xl'>
					<p className='text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
						<T k='tool.ai.eyebrow' />
					</p>
					<h1 className='mt-4 text-4xl font-bold tracking-tight md:text-6xl'>
						<T k='tool.ai.title' />
					</h1>
					<p className='mt-5 text-lg leading-8 text-(--color-app-text-secondary)'>
						<T k='tool.ai.description' />
					</p>
				</AnimatedSection>
				<AnimatedSection delay={0.08}>
					<AiGeneratorForm />
				</AnimatedSection>
				<AnimatedSection className='mt-16' delay={0.12}>
					<h2 className='mb-6 text-3xl font-bold tracking-tight'>
						<T k='tool.ai.latest' />
					</h2>
					<AiGallery images={images} />
				</AnimatedSection>
			</main>
			<Footer />
		</div>
	)
}
