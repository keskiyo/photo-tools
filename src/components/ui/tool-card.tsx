import { getTranslations } from 'next-intl/server'

import Link from 'next/link'
import type { ReactNode } from 'react'

type ToolCardProps = {
	href: string
	title: ReactNode
	description: ReactNode
	icon: ReactNode
	actionKey?: string
}

export async function ToolCard({
	href,
	title,
	description,
	icon,
	actionKey = 'home.tool.open',
}: ToolCardProps) {
	const t = await getTranslations()
	return (
		<Link
			href={href}
			className='focus-ring app-surface gradient-border group flex h-full min-h-72 flex-col rounded-(--radius-card) p-7 transition duration-200 hover:-translate-y-2 hover:shadow-(--shadow-card-hover)'
		>
			<span className='grid h-14 w-14 place-items-center rounded-2xl bg-(--gradient-app-soft) text-(--color-app-text)'>
				{icon}
			</span>
			<span className='mt-8 min-h-16 text-2xl font-semibold tracking-tight'>
				{title}
			</span>
			<span className='mt-3 min-h-18 text-sm leading-6 text-(--color-app-text-secondary)'>
				{description}
			</span>
			<span className='mt-auto pt-8 text-sm font-semibold text-(--color-app-accent)'>
				{t(actionKey)}
			</span>
		</Link>
	)
}
