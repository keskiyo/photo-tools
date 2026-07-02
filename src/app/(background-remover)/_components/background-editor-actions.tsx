'use client'

import { useTranslations } from 'next-intl'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import type { DownloadFormat, EditorActionsProps } from '../_types'

const DOWNLOAD_FORMATS: DownloadFormat[] = ['png', 'webp', 'jpg']
type DownloadMenuId = 'hd' | 'free'

export function BackgroundEditorActions({
	disabled,
	onDownload,
}: EditorActionsProps) {
	const t = useTranslations()
	const [format, setFormat] = useState<DownloadFormat>('png')
	const [openMenu, setOpenMenu] = useState<DownloadMenuId | null>(null)

	function chooseFormat(nextFormat: DownloadFormat) {
		setFormat(nextFormat)
		setOpenMenu(null)
		onDownload(nextFormat)
	}

	return (
		<aside className="flex flex-col items-stretch gap-4 pt-2 text-center">
			<p className="text-base font-bold text-(--color-app-text-secondary)">
				{t('tool.bg.uploadImage')}
			</p>
			<ActionButton
				chooseFormatLabel={t('tool.bg.chooseDownloadFormat')}
				currentFormat={format}
				disabled={disabled}
				isOpen={openMenu === 'hd'}
				onDownload={() => onDownload(format)}
				onFormatChange={chooseFormat}
				onToggleMenu={() =>
					setOpenMenu(currentMenu => (currentMenu === 'hd' ? null : 'hd'))
				}
				variant="primary"
			>
				{t('tool.bg.downloadHd')}
			</ActionButton>
			<p className="text-base font-semibold text-(--color-app-text-muted)">
				{t('tool.bg.hdLimit')}
			</p>
			<ActionButton
				chooseFormatLabel={t('tool.bg.chooseDownloadFormat')}
				currentFormat={format}
				disabled={disabled}
				isOpen={openMenu === 'free'}
				onDownload={() => onDownload(format)}
				onFormatChange={chooseFormat}
				onToggleMenu={() =>
					setOpenMenu(currentMenu => (currentMenu === 'free' ? null : 'free'))
				}
				variant="outline"
			>
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
	chooseFormatLabel,
	currentFormat,
	disabled,
	isOpen,
	onDownload,
	onFormatChange,
	onToggleMenu,
	variant,
}: {
	children: string
	chooseFormatLabel: string
	currentFormat: DownloadFormat
	disabled: boolean
	isOpen: boolean
	onDownload: () => void
	onFormatChange: (format: DownloadFormat) => void
	onToggleMenu: () => void
	variant: 'primary' | 'outline'
}) {
	const variantClass = {
		primary: 'gradient-button text-(--color-app-text)',
		outline:
			'border border-(--color-app-accent) bg-[color-mix(in_srgb,var(--color-app-text)_3%,transparent)] text-(--color-app-text)',
	}[variant]
	const dividerClass = {
		primary: 'border-white/20',
		outline: 'border-(--color-app-border)',
	}[variant]
	const wrapperClass = disabled
		? 'border border-(--color-app-border) bg-[color-mix(in_srgb,var(--color-app-text)_6%,transparent)] text-(--color-app-text-muted)'
		: variantClass

	return (
		<div className="relative">
			<div
				className={`grid min-h-12 grid-cols-[minmax(0,1fr)_3.75rem] overflow-hidden rounded-full ${wrapperClass}`}
			>
				<button
					type="button"
					disabled={disabled}
					onClick={onDownload}
					className="focus-ring cursor-pointer px-5 text-base font-bold disabled:cursor-not-allowed"
				>
					{children}
				</button>
				<button
					type="button"
					aria-expanded={isOpen}
					aria-label={chooseFormatLabel}
					disabled={disabled}
					onClick={onToggleMenu}
					className={`focus-ring grid cursor-pointer place-items-center border-l ${dividerClass} disabled:cursor-not-allowed`}
				>
					<ChevronDown
						aria-hidden="true"
						className={`h-5 w-5 transition ${isOpen ? 'rotate-180' : ''}`}
					/>
				</button>
			</div>

			{isOpen && !disabled ? (
				<div className="absolute right-0 top-[calc(100%+0.45rem)] z-20 w-32 overflow-hidden rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface) p-1 text-left shadow-(--shadow-card)">
					{DOWNLOAD_FORMATS.map(downloadFormat => (
						<button
							key={downloadFormat}
							type="button"
							onClick={() => onFormatChange(downloadFormat)}
							className={`focus-ring block min-h-9 w-full cursor-pointer rounded-[calc(var(--radius-control)-0.35rem)] px-3 text-sm font-bold uppercase transition ${
								downloadFormat === currentFormat
									? 'bg-[color-mix(in_srgb,var(--color-app-accent)_18%,transparent)] text-(--color-app-accent)'
									: 'text-(--color-app-text) hover:bg-[color-mix(in_srgb,var(--color-app-text)_6%,transparent)]'
							}`}
						>
							{downloadFormat}
						</button>
					))}
				</div>
			) : null}
		</div>
	)
}
