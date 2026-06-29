'use client'

import { Brush, ImagePlus } from 'lucide-react'
import type { ReactNode } from 'react'

import { useLocalization } from '@/localization'

export function BackgroundEditorTools({ disabled }: { disabled: boolean }) {
	const { t } = useLocalization()

	return (
		<div className='mt-4 flex flex-wrap items-center justify-center gap-8'>
			<ToolButton
				disabled={disabled}
				icon={<ImagePlus aria-hidden='true' />}
			>
				{t('tool.bg.addBackground')}
			</ToolButton>
			<ToolButton disabled={disabled} icon={<Brush aria-hidden='true' />}>
				{t('tool.bg.erase')}
			</ToolButton>
		</div>
	)
}

function ToolButton({
	children,
	disabled,
	icon,
}: {
	children: string
	disabled: boolean
	icon: ReactNode
}) {
	return (
		<button
			type='button'
			disabled={disabled}
			className='focus-ring inline-flex min-h-12 items-center gap-3 rounded-full px-2 text-base font-bold text-(--color-bg-editor-text) disabled:text-(--color-bg-editor-muted)'
		>
			<span className='grid h-11 w-11 place-items-center rounded-full border border-[color-mix(in_srgb,var(--color-bg-editor-muted)_32%,transparent)] bg-(--color-bg-editor-surface) shadow-[0_10px_24px_var(--color-bg-editor-shadow)] [&>svg]:h-5 [&>svg]:w-5'>
				{icon}
			</span>
			{children}
		</button>
	)
}
