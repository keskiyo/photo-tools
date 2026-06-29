import { FileImage, ImageOff, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import type { ReactNode } from 'react'

import type { TranslationKey } from '@/localization'

export const homeTools = [
	{
		href: '/background-remover',
		titleKey: 'home.tool.bg.title',
		descriptionKey: 'home.tool.bg.description',
		icon: <ImageOff aria-hidden='true' className='h-7 w-7' />,
	},
	{
		href: '/converter',
		titleKey: 'home.tool.converter.title',
		descriptionKey: 'home.tool.converter.description',
		icon: <FileImage aria-hidden='true' className='h-7 w-7' />,
	},
	{
		href: '/ai-generator',
		titleKey: 'home.tool.ai.title',
		descriptionKey: 'home.tool.ai.description',
		icon: <Sparkles aria-hidden='true' className='h-7 w-7' />,
	},
] satisfies {
	href: string
	titleKey: TranslationKey
	descriptionKey: TranslationKey
	icon: ReactNode
}[]

export const workflowSteps = [
	'home.workflow.step1',
	'home.workflow.step2',
	'home.workflow.step3',
	'home.workflow.step4',
] satisfies TranslationKey[]

export const pricingTiers = [
	{
		nameKey: 'home.tier.starter.name',
		priceKey: 'home.tier.starter.price',
		descriptionKey: 'home.tier.starter.description',
		featureKeys: [
			'home.tier.starter.feature1',
			'home.tier.starter.feature2',
			'home.tier.starter.feature3',
		],
	},
	{
		nameKey: 'home.tier.studio.name',
		priceKey: 'home.tier.studio.price',
		descriptionKey: 'home.tier.studio.description',
		featureKeys: [
			'home.tier.studio.feature1',
			'home.tier.studio.feature2',
			'home.tier.studio.feature3',
		],
		featured: true,
	},
	{
		nameKey: 'home.tier.ops.name',
		priceKey: 'home.tier.ops.price',
		descriptionKey: 'home.tier.ops.description',
		featureKeys: [
			'home.tier.ops.feature1',
			'home.tier.ops.feature2',
			'home.tier.ops.feature3',
		],
	},
] satisfies {
	nameKey: TranslationKey
	priceKey: TranslationKey
	descriptionKey: TranslationKey
	featureKeys: TranslationKey[]
	featured?: boolean
}[]

export const faqs = [
	{ questionKey: 'home.faq.one.question', answerKey: 'home.faq.one.answer' },
	{ questionKey: 'home.faq.two.question', answerKey: 'home.faq.two.answer' },
	{
		questionKey: 'home.faq.three.question',
		answerKey: 'home.faq.three.answer',
	},
] satisfies { questionKey: TranslationKey; answerKey: TranslationKey }[]

export const capabilities = [
	{
		titleKey: 'home.cap.local.title',
		icon: <FileImage aria-hidden='true' />,
	},
	{
		titleKey: 'home.cap.history.title',
		icon: <ShieldCheck aria-hidden='true' />,
	},
	{ titleKey: 'home.cap.fallback.title', icon: <Zap aria-hidden='true' /> },
] satisfies { titleKey: TranslationKey; icon: ReactNode }[]
