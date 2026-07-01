import { getTranslations } from 'next-intl/server'

import Image from 'next/image'

import { ButtonLink } from '@/components/ui/button-link'

export async function HomeHero() {
	const t = await getTranslations()
	return (
		<section className="app-container grid min-h-[calc(100vh-5rem)] items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.12fr_0.88fr] lg:py-24">
			<div>
				<p className="mb-5 w-fit rounded-full border border-(--color-app-border) bg-(--gradient-app-soft) px-4 py-2 text-sm font-semibold text-(--color-app-accent)">
					{t('home.badge')}
				</p>
				<h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">
					{t('home.title.prefix')}{' '}
					<span className="gradient-text">PhotoTools</span>
				</h1>
				<p className="mt-6 max-w-2xl text-lg leading-8 text-(--color-app-text-secondary) md:text-xl">
					{t('home.subtitle')}
				</p>
				<div className="mt-9 flex flex-col gap-4 sm:flex-row">
					<ButtonLink href="/background-remover">
						{t('home.cta.start')}
					</ButtonLink>
					<ButtonLink href="/ai-generator" variant="secondary">
						{t('home.cta.generate')}
					</ButtonLink>
				</div>
			</div>
			<div className="app-surface relative mx-auto w-full max-w-md overflow-hidden rounded-(--radius-card) p-5 md:p-6 lg:max-w-115">
				<div className="absolute inset-0 bg-(--gradient-app-soft)" />
				<Image
					src="/phototools-app.png"
					alt="PhotoTools gradient image editor mark"
					width={460}
					height={460}
					priority
					className="app-image-glow relative mx-auto h-auto w-full max-w-sm md:max-w-md"
					style={{ height: 'auto' }}
				/>
			</div>
		</section>
	)
}
