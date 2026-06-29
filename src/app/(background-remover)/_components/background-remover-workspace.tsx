'use client'

import { BadgePlus } from 'lucide-react'
import Image from 'next/image'

import { AppLoader } from '@/components/ui/app-loader'
import { useLocalization } from '@/localization'

import { BackgroundEditorActions } from './background-editor-actions'
import { BackgroundEditorTools } from './background-editor-tools'

type WorkspaceStatus = 'processing' | 'ready'

type BackgroundRemoverWorkspaceProps = {
	status: WorkspaceStatus
	sourceUrl: string
	resultUrl?: string
	onDownload: () => void
	onUploadAnother: () => void
}

export function BackgroundRemoverWorkspace({
	status,
	sourceUrl,
	resultUrl,
	onDownload,
	onUploadAnother,
}: BackgroundRemoverWorkspaceProps) {
	const isReady = status === 'ready' && resultUrl

	return (
		<section className='rounded-(--radius-card) bg-(--color-bg-editor-page) p-5 text-(--color-bg-editor-text) shadow-[0_28px_90px_var(--color-bg-editor-shadow)] md:p-8'>
			<div className='grid gap-8 lg:grid-cols-[7rem_minmax(0,1fr)_15rem]'>
				<EditorRail
					sourceUrl={sourceUrl}
					onUploadAnother={onUploadAnother}
				/>
				<div>
					<EditorCanvas
						status={status}
						sourceUrl={sourceUrl}
						resultUrl={resultUrl}
					/>
					<BackgroundEditorTools disabled={!isReady} />
				</div>
				<BackgroundEditorActions
					disabled={!isReady}
					onDownload={onDownload}
				/>
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
	const { t } = useLocalization()

	return (
		<div className='flex items-center justify-center gap-3 lg:flex-col lg:justify-start'>
			<button
				type='button'
				onClick={onUploadAnother}
				aria-label={t('tool.bg.uploadAnother')}
				className='focus-ring grid h-20 w-20 cursor-pointer place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-bg-editor-accent)_18%,var(--color-bg-editor-surface))] text-2xl text-(--color-bg-editor-accent)'
			>
				<BadgePlus aria-hidden='true' className='h-6 w-6' />
			</button>
			<div className='relative h-20 w-20 overflow-hidden rounded-full border-[3px] border-(--color-bg-editor-accent) bg-[color-mix(in_srgb,var(--color-bg-editor-secondary)_26%,var(--color-bg-editor-surface))]'>
				<Image
					src={sourceUrl}
					alt={t('tool.bg.sourcePreview')}
					fill
					unoptimized
					sizes='80px'
					className='object-cover'
				/>
			</div>
		</div>
	)
}

function EditorCanvas({
	status,
	sourceUrl,
	resultUrl,
}: {
	status: WorkspaceStatus
	sourceUrl: string
	resultUrl?: string
}) {
	const { t } = useLocalization()

	if (status === 'processing') {
		return (
			<div className='grid min-h-96 place-items-center rounded-[1.35rem] bg-(--color-bg-editor-surface) shadow-[0_26px_70px_var(--color-bg-editor-shadow)] md:min-h-136'>
				<div className='flex flex-col items-center gap-5 text-center'>
					<AppLoader label={t('common.loading')} />
					<div>
						<p className='text-xl font-semibold text-(--color-bg-editor-accent)'>
							{t('tool.bg.processingTitle')}
						</p>
						<p className='mt-2 text-base font-semibold text-(--color-bg-editor-muted)'>
							{t('tool.bg.processingDetail')}
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='grid min-h-84 place-items-center overflow-hidden rounded-[1.35rem] bg-[repeating-conic-gradient(var(--color-bg-editor-check-a)_0%_25%,var(--color-bg-editor-check-b)_0%_50%)_50%/24px_24px] shadow-[0_26px_70px_var(--color-bg-editor-shadow)] md:min-h-108'>
			<div className='relative h-full min-h-84 w-full md:min-h-108'>
				<Image
					src={resultUrl ?? sourceUrl}
					alt={t('tool.bg.resultPreview')}
					fill
					sizes='(max-width: 1024px) 100vw, 650px'
					className='object-contain p-10'
				/>
			</div>
		</div>
	)
}
