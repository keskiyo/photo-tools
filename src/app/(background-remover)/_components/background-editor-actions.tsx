'use client'

import { ChevronDown, Info, ThumbsDown, ThumbsUp } from 'lucide-react'

import { useLocalization } from '@/localization'

type EditorActionsProps = {
	disabled: boolean
	onDownload: () => void
}

export function BackgroundEditorActions({
	disabled,
	onDownload,
}: EditorActionsProps) {
	const { t } = useLocalization()

	return (
		<aside className='flex flex-col items-stretch gap-4 pt-2 text-center'>
			<p className='text-base font-bold text-(--color-bg-editor-muted)'>
				{t('tool.bg.uploadImage')}
			</p>
			<ActionButton disabled={disabled} variant='primary'>
				{t('tool.bg.downloadHd')}
			</ActionButton>
			<p className='text-base font-semibold text-(--color-bg-editor-muted)'>
				{t('tool.bg.hdLimit')}
			</p>
			<ActionButton
				disabled={disabled}
				variant='outline'
				onClick={onDownload}
			>
				{t('tool.bg.downloadFree')}
			</ActionButton>
			<p className='text-base font-semibold text-(--color-bg-editor-muted)'>
				{t('tool.bg.freeLimit')}
			</p>
			<p className='mt-6 text-base font-bold text-(--color-bg-editor-muted)'>
				{t('tool.bg.tryAlso')}
			</p>
			<ActionButton disabled={disabled} variant='bulk'>
				{t('tool.bg.bulk')}
			</ActionButton>
			<ActionButton disabled={disabled} variant='video'>
				{t('tool.bg.video')}
			</ActionButton>
			<div className='mt-8 text-(--color-bg-editor-muted)'>
				<p className='inline-flex items-center justify-center gap-2 text-sm font-semibold'>
					{t('tool.bg.rate')}
					<Info aria-hidden='true' className='h-4 w-4' />
				</p>
				<div className='mt-2 flex justify-center gap-4'>
					<ThumbsDown aria-hidden='true' className='h-5 w-5' />
					<ThumbsUp aria-hidden='true' className='h-5 w-5' />
				</div>
			</div>
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
	variant: 'primary' | 'outline' | 'bulk' | 'video'
}) {
	const variantClass = {
		primary:
			'bg-(--color-bg-editor-accent) text-(--color-app-text) shadow-[0_16px_32px_color-mix(in_srgb,var(--color-bg-editor-accent)_24%,transparent)]',
		outline:
			'border-2 border-(--color-bg-editor-accent) bg-(--color-bg-editor-surface) text-(--color-bg-editor-text)',
		bulk: 'bg-[image:var(--gradient-bg-editor-bulk)] text-(--color-app-text)',
		video: 'bg-[image:var(--gradient-bg-editor-video)] text-(--color-app-text)',
	}[variant]

	return (
		<button
			type='button'
			disabled={disabled}
			onClick={onClick}
			className={`focus-ring inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-5 text-base font-bold disabled:cursor-not-allowed disabled:border-0 disabled:bg-(--color-bg-editor-disabled) disabled:text-(--color-app-text) ${variantClass}`}
		>
			{children}
			{variant === 'primary' || variant === 'outline' ? (
				<ChevronDown aria-hidden='true' className='h-5 w-5' />
			) : null}
		</button>
	)
}
