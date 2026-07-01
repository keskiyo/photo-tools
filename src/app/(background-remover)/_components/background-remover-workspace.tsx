'use client'

import { useTranslations } from 'next-intl'

import { BadgePlus } from 'lucide-react'
import Image from 'next/image'

import { AppLoader } from '@/components/ui/app-loader'

import type {
	BackgroundRemoverWorkspaceProps,
	WorkspaceStatus,
} from '../_types'
import { BackgroundEditorActions } from './background-editor-actions'
import { BackgroundEditorTools } from './background-editor-tools'

export function BackgroundRemoverWorkspace({
	status,
	sourceUrl,
	resultUrl,
	backgroundColor,
	onBackgroundColorChange,
	onDownload,
	onUploadAnother,
}: BackgroundRemoverWorkspaceProps) {
	const isReady = status === 'ready' && resultUrl

	return (
		<section className="app-surface-strong rounded-(--radius-card) p-5 text-(--color-app-text) md:p-8">
			<div className="grid gap-8 lg:grid-cols-[7rem_minmax(0,1fr)_15rem]">
				<EditorRail sourceUrl={sourceUrl} onUploadAnother={onUploadAnother} />
				<div>
					<EditorCanvas
						status={status}
						sourceUrl={sourceUrl}
						resultUrl={resultUrl}
						backgroundColor={backgroundColor}
					/>
					<BackgroundEditorTools
						backgroundColor={backgroundColor}
						disabled={!isReady}
						onBackgroundColorChange={onBackgroundColorChange}
					/>
				</div>
				<BackgroundEditorActions disabled={!isReady} onDownload={onDownload} />
			</div>
		</section>
	)
}

function EditorRail({
	sourceUrl,
	onUploadAnother,
}: {
	sourceUrl: string
	onUploadAnother: () => void
}) {
	const t = useTranslations()

	return (
		<div className="flex items-center justify-center gap-3 lg:flex-col lg:justify-start">
			<button
				type="button"
				onClick={onUploadAnother}
				aria-label={t('tool.bg.uploadAnother')}
				className="focus-ring grid h-20 w-20 cursor-pointer place-items-center rounded-full border border-(--color-app-border) bg-(--gradient-app-soft) text-2xl text-(--color-app-accent)"
			>
				<BadgePlus aria-hidden="true" className="h-6 w-6" />
			</button>
			<div className="relative h-20 w-20 overflow-hidden rounded-full border-[3px] border-(--color-app-accent) bg-[color-mix(in_srgb,var(--color-app-accent)_18%,var(--color-app-surface))]">
				<Image
					src={sourceUrl}
					alt={t('tool.bg.sourcePreview')}
					fill
					unoptimized
					sizes="80px"
					className="object-cover"
				/>
			</div>
		</div>
	)
}

function EditorCanvas({
	status,
	sourceUrl,
	resultUrl,
	backgroundColor,
}: {
	status: WorkspaceStatus
	sourceUrl: string
	resultUrl?: string
	backgroundColor?: string
}) {
	const t = useTranslations()
	const readyBackground = backgroundColor
		? 'bg-(--color-app-surface)'
		: 'bg-[repeating-conic-gradient(color-mix(in_srgb,var(--color-app-text)_8%,transparent)_0%_25%,color-mix(in_srgb,var(--color-app-text)_14%,transparent)_0%_50%)_50%/24px_24px]'

	if (status === 'processing') {
		return (
			<div className="grid min-h-96 place-items-center rounded-[1.35rem] border border-(--color-app-border) bg-[color-mix(in_srgb,var(--color-app-surface)_88%,transparent)] shadow-(--shadow-card) md:min-h-136">
				<div className="flex w-full max-w-xs flex-col items-center justify-center gap-5 text-center">
					<AppLoader label={t('common.loading')} />
					<div>
						<p className="text-xl font-semibold text-(--color-app-accent)">
							{t('tool.bg.processingTitle')}
						</p>
						<p className="mt-2 text-base font-semibold text-(--color-app-text-secondary)">
							{t('tool.bg.processingDetail')}
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div
			className={`grid min-h-84 place-items-center overflow-hidden rounded-[1.35rem] border border-(--color-app-border) ${readyBackground} shadow-(--shadow-card) md:min-h-108`}
			style={backgroundColor ? { backgroundColor } : undefined}
		>
			<div className="relative h-full min-h-84 w-full md:min-h-108">
				<Image
					src={resultUrl ?? sourceUrl}
					alt={t('tool.bg.resultPreview')}
					fill
					sizes="(max-width: 1024px) 100vw, 650px"
					className="object-contain p-10"
				/>
			</div>
		</div>
	)
}
