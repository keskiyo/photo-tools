'use client'

import { useFormatter, useTranslations } from 'next-intl'

import {
	CalendarCheck,
	Check,
	Gem,
	Images,
	Rocket,
	ShieldCheck,
	Sparkles,
	WalletCards,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { AnimatedCard } from '@/components/ui/animated-card'
import { AnimatedSection } from '@/components/ui/animated-section'

import { pricingTiers } from './home-data'

const MIN_PHOTOS = 1
const MAX_PHOTOS = 20000
const MONEY_FORMAT = { maximumFractionDigits: 2 } as const

const PRICE_TIERS = [
	{ upTo: 1, rate: 30 },
	{ upTo: 40, rate: 7.5 },
	{ upTo: 100, rate: 5.4 },
	{ upTo: 500, rate: 3.5 },
	{ upTo: Number.POSITIVE_INFINITY, rate: 2.2 },
] as const

const tierIcons = [
	[
		<Rocket key="rocket" aria-hidden="true" />,
		<Images key="images" aria-hidden="true" />,
		<CalendarCheck key="calendar" aria-hidden="true" />,
		<Check key="check" aria-hidden="true" />,
	],
	[
		<Gem key="gem" aria-hidden="true" />,
		<WalletCards key="wallet" aria-hidden="true" />,
		<Sparkles key="sparkles" aria-hidden="true" />,
		<ShieldCheck key="shield" aria-hidden="true" />,
	],
] satisfies ReactNode[][]

function perPhotoRate(count: number) {
	return PRICE_TIERS.find(tier => count <= tier.upTo)?.rate ?? 2.2
}

export function HomePricing() {
	const t = useTranslations()

	return (
		<AnimatedSection
			id="scenarios"
			className="relative overflow-hidden border-y border-(--color-app-border) py-20"
		>
			<div className="app-container relative">
				<div className="mx-auto max-w-4xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)">
						{t('home.tiers.eyebrow')}
					</p>
					<h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-(--color-app-text) md:text-5xl">
						{t('home.tiers.title')}
					</h2>
					<div className="mx-auto mt-3 h-1.5 w-56 max-w-[70%] rounded-full bg-(--gradient-app)" />
				</div>

				<div className="mx-auto mt-10 grid max-w-5xl items-center gap-5 lg:grid-cols-[0.96fr_1.04fr]">
					{pricingTiers.map((tier, index) => (
						<AnimatedCard
							key={tier.nameKey}
							delay={index * 0.12}
							className="h-full"
						>
							<PricingCard
								iconSet={tierIcons[index] ?? tierIcons[0]}
								isFeatured={Boolean(tier.featured)}
								tier={tier}
							/>
						</AnimatedCard>
					))}
				</div>
			</div>
		</AnimatedSection>
	)
}

function PricingCard({
	iconSet,
	isFeatured,
	tier,
}: {
	iconSet: ReactNode[]
	isFeatured: boolean
	tier: (typeof pricingTiers)[number]
}) {
	const t = useTranslations()
	const format = useFormatter()
	const [photoCount, setPhotoCount] = useState(MIN_PHOTOS)
	const pricePerPhoto = perPhotoRate(photoCount)
	const totalCost = photoCount * pricePerPhoto

	function updatePhotoCount(value: number) {
		setPhotoCount(Math.min(MAX_PHOTOS, Math.max(MIN_PHOTOS, value)))
	}

	return (
		<article
			className={`relative flex h-full flex-col overflow-hidden rounded-(--radius-card) border text-(--color-app-text) shadow-(--shadow-card) backdrop-blur-2xl ${
				isFeatured
					? 'border-[color-mix(in_srgb,var(--color-app-accent)_58%,transparent)] bg-[color-mix(in_srgb,var(--color-app-surface)_94%,var(--color-app-accent)_6%)] shadow-(--shadow-card-hover)'
					: 'min-h-125 border-(--color-app-border-strong) bg-(--color-app-surface)'
			}`}
		>
			<PricingHeader isFeatured={isFeatured} tier={tier} />
			<div className="flex flex-1 flex-col px-7 py-7">
				{tier.featureGroups ? (
					<FeatureGroups groups={tier.featureGroups} />
				) : (
					<FeatureList
						features={tier.featureKeys ?? []}
						iconSet={iconSet}
						isFeatured={isFeatured}
					/>
				)}

				<div className="mt-auto pt-6">
					{isFeatured ? (
						<PricingCalculator
							format={format}
							photoCount={photoCount}
							pricePerPhoto={pricePerPhoto}
							totalCost={totalCost}
							onChange={updatePhotoCount}
						/>
					) : null}
					<Link
						className={`focus-ring block rounded-(--radius-button) px-5 py-4 text-center text-base font-bold transition-colors ${
							isFeatured
								? 'gradient-button'
								: 'border border-(--color-app-border-strong) bg-(--color-app-surface-light) text-(--color-app-text) hover:bg-(--gradient-app-soft)'
						}`}
						href={isFeatured ? '/login' : '/background-remover'}
					>
						{t(tier.ctaKey)}
					</Link>
				</div>
			</div>
		</article>
	)
}

function PricingHeader({
	isFeatured,
	tier,
}: {
	isFeatured: boolean
	tier: (typeof pricingTiers)[number]
}) {
	const t = useTranslations()

	return (
		<div
			className={`mx-3 mt-3 rounded-(--radius-control) px-6 py-6 text-center text-(--color-app-text) ${
				isFeatured ? 'bg-(--gradient-app)' : 'bg-(--gradient-app-soft)'
			}`}
		>
			{isFeatured ? (
				<span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-(--radius-button) border border-(--color-app-border) bg-(--color-app-surface-light) px-4 py-1 text-xs font-bold text-(--color-app-accent)">
					{t(tier.badgeKey)}
				</span>
			) : null}
			<p className="text-3xl font-black tracking-normal">{t(tier.priceKey)}</p>
			<p className="text-lg font-medium opacity-92">{t(tier.descriptionKey)}</p>
		</div>
	)
}

function FeatureGroups({
	groups,
}: {
	groups: NonNullable<(typeof pricingTiers)[number]['featureGroups']>
}) {
	const t = useTranslations()

	return (
		<div className="mt-5 space-y-5">
			{groups.map(group => (
				<div key={group.titleKey}>
					<div className="flex items-center gap-3">
						<FeatureIcon>{group.icon}</FeatureIcon>
						<p className="text-base font-bold text-(--color-app-text)">
							{t(group.titleKey)}
						</p>
					</div>
					<ul className="mt-3 space-y-2 pl-11">
						{group.items.map(item => (
							<li
								key={item}
								className="flex items-center gap-3 text-sm font-medium leading-6 text-(--color-app-text-secondary)"
							>
								<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-app-text-muted)" />
								{t(item)}
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	)
}

function FeatureList({
	features,
	iconSet,
	isFeatured,
}: {
	features: string[]
	iconSet: ReactNode[]
	isFeatured: boolean
}) {
	const t = useTranslations()

	return (
		<ul className="mt-6 space-y-4">
			{features.map((feature, index) => (
				<li key={feature} className="flex items-start gap-4">
					<FeatureIcon isFeatured={isFeatured}>{iconSet[index]}</FeatureIcon>
					<span className="mt-1.5 text-base font-semibold leading-6">
						{t(feature)}
					</span>
				</li>
			))}
		</ul>
	)
}

function FeatureIcon({
	children,
	isFeatured = false,
}: {
	children: ReactNode
	isFeatured?: boolean
}) {
	return (
		<span
			className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-(--radius-button) border ${
				isFeatured
					? 'border-[color-mix(in_srgb,var(--color-app-accent)_55%,transparent)] text-(--color-app-accent)'
					: 'border-[color-mix(in_srgb,var(--color-app-accent-strong)_45%,transparent)] text-(--color-app-accent-strong)'
			}`}
		>
			<span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{children}</span>
		</span>
	)
}

function PricingCalculator({
	format,
	onChange,
	photoCount,
	pricePerPhoto,
	totalCost,
}: {
	format: ReturnType<typeof useFormatter>
	onChange: (value: number) => void
	photoCount: number
	pricePerPhoto: number
	totalCost: number
}) {
	const t = useTranslations()

	return (
		<div className="mb-6 border-t border-(--color-app-border) pt-6">
			<div className="flex items-end justify-between gap-3">
				<label
					className="text-sm font-semibold text-(--color-app-text-secondary)"
					htmlFor="premium-photo-count"
				>
					{t('home.tier.studio.countLabel')}
				</label>
				<div className="flex items-end gap-3">
					<div className="relative w-24 pb-1 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-(--color-app-accent)">
						<input
							id="premium-photo-count"
							className="number-input w-full border-0 bg-transparent p-0 text-center text-4xl font-black text-(--color-app-text) outline-none focus:outline-none focus-visible:outline-none"
							inputMode="numeric"
							max={MAX_PHOTOS}
							min={MIN_PHOTOS}
							type="number"
							value={photoCount}
							onChange={event =>
								onChange(Number(event.target.value) || MIN_PHOTOS)
							}
						/>
					</div>
					<span className="pb-2 text-sm font-semibold text-(--color-app-text-secondary)">
						{t('home.tier.studio.countUnit')}
					</span>
				</div>
			</div>
			<div className="app-subtle-fill mt-5 rounded-(--radius-control) border border-(--color-app-border) px-5 py-4">
				<p className="text-sm font-bold uppercase tracking-[0.08em] text-(--color-app-text-muted)">
					{t('home.tier.studio.total')}
				</p>
				<p className="mt-2 text-3xl font-black">
					{format.number(totalCost, MONEY_FORMAT)} ₽
				</p>
				<p className="text-sm font-bold text-(--color-app-accent)">
					{format.number(pricePerPhoto, MONEY_FORMAT)} ₽ /{' '}
					{t('home.tier.studio.perPhoto')}
				</p>
			</div>
		</div>
	)
}
