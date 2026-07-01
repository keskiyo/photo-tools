import {
	CalendarCheck,
	FileImage,
	ImageOff,
	Rocket,
	ShieldCheck,
	Sparkles,
	Zap,
} from 'lucide-react'
import type { ReactNode } from 'react'

export const homeTools = [
	{
		href: '/background-remover',
		titleKey: 'home.tool.bg.title',
		descriptionKey: 'home.tool.bg.description',
		icon: <ImageOff aria-hidden="true" className="h-7 w-7" />,
	},
	{
		href: '/converter',
		titleKey: 'home.tool.converter.title',
		descriptionKey: 'home.tool.converter.description',
		icon: <FileImage aria-hidden="true" className="h-7 w-7" />,
	},
	{
		href: '/ai-generator',
		titleKey: 'home.tool.ai.title',
		descriptionKey: 'home.tool.ai.description',
		icon: <Sparkles aria-hidden="true" className="h-7 w-7" />,
	},
] satisfies {
	href: string
	titleKey: string
	descriptionKey: string
	icon: ReactNode
}[]

export const workflowSteps = [
	'home.workflow.step1',
	'home.workflow.step2',
	'home.workflow.step3',
	'home.workflow.step4',
] satisfies string[]

export const pricingTiers = [
	{
		nameKey: 'home.tier.starter.name',
		priceKey: 'home.tier.starter.price',
		badgeKey: 'home.tier.starter.badge',
		descriptionKey: 'home.tier.starter.description',
		featureGroups: [
			{
				icon: <Rocket aria-hidden="true" />,
				titleKey: 'home.tier.starter.bonus.title',
				infoKey: 'home.tier.starter.bonus.info',
				items: [
					'home.tier.starter.bonus.item1',
					'home.tier.starter.bonus.item2',
				],
			},
			{
				icon: <CalendarCheck aria-hidden="true" />,
				titleKey: 'home.tier.starter.daily.title',
				infoKey: 'home.tier.starter.daily.info',
				items: [
					'home.tier.starter.daily.item1',
					'home.tier.starter.daily.item2',
				],
			},
		],
		ctaKey: 'home.tier.starter.cta',
	},
	{
		nameKey: 'home.tier.studio.name',
		priceKey: 'home.tier.studio.price',
		badgeKey: 'home.tier.studio.badge',
		descriptionKey: 'home.tier.studio.description',
		featureKeys: [
			'home.tier.studio.feature1',
			'home.tier.studio.feature2',
			'home.tier.studio.feature3',
		],
		ctaKey: 'home.tier.studio.cta',
		featured: true,
	},
] satisfies {
	nameKey: string
	priceKey: string
	badgeKey: string
	descriptionKey: string
	ctaKey: string
	featured?: boolean
	featureKeys?: string[]
	featureGroups?: {
		icon: ReactNode
		titleKey: string
		infoKey: string
		items: string[]
	}[]
}[]

export const faqs = [
	{ questionKey: 'home.faq.one.question', answerKey: 'home.faq.one.answer' },
	{ questionKey: 'home.faq.two.question', answerKey: 'home.faq.two.answer' },
	{
		questionKey: 'home.faq.three.question',
		answerKey: 'home.faq.three.answer',
	},
	{
		questionKey: 'home.faq.four.question',
		answerKey: 'home.faq.four.answer',
	},
] satisfies { questionKey: string; answerKey: string }[]

export const capabilities = [
	{
		titleKey: 'home.cap.local.title',
		descriptionKey: 'home.cap.local.description',
		icon: <FileImage aria-hidden="true" />,
	},
	{
		titleKey: 'home.cap.history.title',
		descriptionKey: 'home.cap.history.description',
		icon: <ShieldCheck aria-hidden="true" />,
	},
	{
		titleKey: 'home.cap.fallback.title',
		descriptionKey: 'home.cap.fallback.description',
		icon: <Zap aria-hidden="true" />,
	},
] satisfies { titleKey: string; descriptionKey: string; icon: ReactNode }[]
