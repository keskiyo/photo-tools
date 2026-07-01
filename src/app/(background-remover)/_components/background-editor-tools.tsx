'use client'

import { useTranslations } from 'next-intl'

import { Brush, ImagePlus } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'

import type { BackgroundEditorToolsProps } from '../_types'

const DEFAULT_BACKGROUND_COLOR = '#ffffff'
const BACKGROUND_PRESETS = [
	'#ffffff',
	'#f8fafc',
	'#111827',
	'#4facfe',
	'#22c55e',
	'#f472b6',
] as const

export function BackgroundEditorTools({
	backgroundColor,
	disabled,
	onBackgroundColorChange,
}: BackgroundEditorToolsProps) {
	const t = useTranslations()
	const [isBackgroundPanelOpen, setIsBackgroundPanelOpen] = useState(false)

	return (
		<div className="mt-4">
			<div className="flex flex-wrap items-center justify-center gap-8">
				<ToolButton
					ariaExpanded={isBackgroundPanelOpen}
					disabled={disabled}
					icon={<ImagePlus aria-hidden="true" />}
					isActive={Boolean(backgroundColor)}
					onClick={() => setIsBackgroundPanelOpen(isOpen => !isOpen)}
				>
					{t('tool.bg.addBackground')}
				</ToolButton>
				<ToolButton disabled={disabled} icon={<Brush aria-hidden="true" />}>
					{t('tool.bg.erase')}
				</ToolButton>
			</div>

			{isBackgroundPanelOpen && !disabled ? (
				<div className="mx-auto mt-4 max-w-md rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface) p-4 shadow-(--shadow-card)">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-sm font-semibold text-(--color-app-text)">
								{t('tool.bg.backgroundColor')}
							</p>
							<p className="mt-1 text-xs leading-5 text-(--color-app-text-secondary)">
								{t('tool.bg.backgroundColorHelp')}
							</p>
						</div>
						<label className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-(--color-app-border) bg-(--color-app-surface-strong)">
							<span className="sr-only">
								{t('tool.bg.customBackgroundColor')}
							</span>
							<input
								type="color"
								value={backgroundColor ?? DEFAULT_BACKGROUND_COLOR}
								onChange={event => onBackgroundColorChange(event.target.value)}
								className="h-16 w-16 cursor-pointer border-0 bg-transparent p-0"
							/>
						</label>
					</div>

					<div
						aria-label={t('tool.bg.backgroundPresets')}
						className="mt-4 flex flex-wrap items-center gap-2"
					>
						{BACKGROUND_PRESETS.map(color => (
							<button
								key={color}
								type="button"
								aria-label={color}
								onClick={() => onBackgroundColorChange(color)}
								className="focus-ring h-9 w-9 cursor-pointer rounded-full border border-(--color-app-border) shadow-(--shadow-card)"
								style={{ backgroundColor: color }}
							/>
						))}
						<button
							type="button"
							onClick={() => onBackgroundColorChange(undefined)}
							className="focus-ring min-h-9 cursor-pointer rounded-full border border-(--color-app-border) px-4 text-sm font-semibold text-(--color-app-text-secondary) transition hover:text-(--color-app-text)"
						>
							{t('tool.bg.transparentBackground')}
						</button>
					</div>
				</div>
			) : null}
		</div>
	)
}

function ToolButton({
	ariaExpanded,
	children,
	disabled,
	icon,
	isActive,
	onClick,
}: {
	ariaExpanded?: boolean
	children: string
	disabled: boolean
	icon: ReactNode
	isActive?: boolean
	onClick?: () => void
}) {
	return (
		<button
			type="button"
			aria-expanded={ariaExpanded}
			disabled={disabled}
			onClick={onClick}
			className="focus-ring inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-full px-2 text-base font-bold text-(--color-app-text) disabled:cursor-not-allowed disabled:text-(--color-app-text-muted)"
		>
			<span
				className={
					isActive
						? 'grid h-11 w-11 place-items-center rounded-full border border-(--color-app-accent) bg-(--gradient-app-primary) text-white shadow-(--shadow-card) [&>svg]:h-5 [&>svg]:w-5'
						: 'grid h-11 w-11 place-items-center rounded-full border border-(--color-app-border) bg-[color-mix(in_srgb,var(--color-app-text)_5%,transparent)] shadow-(--shadow-card) [&>svg]:h-5 [&>svg]:w-5'
				}
			>
				{icon}
			</span>
			{children}
		</button>
	)
}
