'use client'

import { useTranslations } from 'next-intl'

import { ChevronDown } from 'lucide-react'

import type { EditorActionsProps } from '../_types'

export function BackgroundEditorActions({
	disabled,
	onDownload,
}: EditorActionsProps) {
	const t = useTranslations()

	return (
		<aside className="flex flex-col items-stretch gap-4 pt-2 text-center">
			<p className="text-base font-bold text-(--color-app-text-secondary)">
				{t('tool.bg.uploadImage')}
			</p>
			<ActionButton disabled={disabled} variant="primary">
				{t('tool.bg.downloadHd')}
			</ActionButton>
			<p className="text-base font-semibold text-(--color-app-text-muted)">
				{t('tool.bg.hdLimit')}
			</p>
			<ActionButton disabled={disabled} variant="outline" onClick={onDownload}>
				{t('tool.bg.downloadFree')}
			</ActionButton>
			<p className="text-base font-semibold text-(--color-app-text-muted)">
				{t('tool.bg.freeLimit')}
			</p>
		</aside>
	)
}

function ActionButton({
	children,
	disabled,
	onClick,
	variant,
}: {
	children: string
	disabled: boolean
	onClick?: () => void
	variant: 'primary' | 'outline'
}) {
	const variantClass = {
		primary: 'gradient-button text-(--color-app-text)',
		outline:
			'border border-(--color-app-accent) bg-[color-mix(in_srgb,var(--color-app-text)_3%,transparent)] text-(--color-app-text)',
	}[variant]

	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className={`focus-ring inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-5 text-base font-bold disabled:cursor-not-allowed disabled:border-(--color-app-border) disabled:bg-[color-mix(in_srgb,var(--color-app-text)_6%,transparent)] disabled:text-(--color-app-text-muted) ${variantClass}`}
		>
			{children}
			<ChevronDown aria-hidden="true" className="h-5 w-5" />
		</button>
	)
}
