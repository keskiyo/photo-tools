'use client'

import { useTranslations } from 'next-intl'

import Image from 'next/image'
import type { ReactNode } from 'react'

import { downloadFile, getDownloadFileName } from '@/lib/download'

type ResultPanelProps = {
	title: ReactNode
	resultUrl?: string
	beforeUrl?: string
}

export function ResultPanel({ title, resultUrl, beforeUrl }: ResultPanelProps) {
	const t = useTranslations()

	async function downloadResult() {
		if (!resultUrl) return
		await downloadFile(resultUrl, getDownloadFileName(resultUrl))
	}

	if (!resultUrl) {
		return (
			<div className='app-surface grid min-h-80 place-items-center rounded-(--radius-card) p-8 text-center'>
				<div>
					<p className='text-lg font-semibold'>
						{t('common.noResult.title')}
					</p>
					<p className='mt-2 text-sm text-(--color-app-text-secondary)'>
						{t('common.noResult.description')}
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className='app-surface rounded-(--radius-card) p-5'>
			<div className='mb-4 flex items-center justify-between gap-4'>
				<h2 className='text-xl font-semibold'>{title}</h2>
				<button
					type='button'
					onClick={downloadResult}
					className='focus-ring gradient-button inline-flex min-h-10 items-center rounded-(--radius-button) px-4 text-sm font-semibold'
				>
					{t('common.download')}
				</button>
			</div>
			<div className={beforeUrl ? 'grid gap-4 md:grid-cols-2' : ''}>
				{beforeUrl ? (
					<PreviewImage label={t('common.before')} src={beforeUrl} />
				) : null}
				<PreviewImage
					label={beforeUrl ? t('common.after') : t('common.result')}
					src={resultUrl}
				/>
			</div>
		</div>
	)
}

function PreviewImage({ label, src }: { label: string; src: string }) {
	return (
		<div className='overflow-hidden rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-bg-soft)'>
			<div className='border-b border-(--color-app-border) px-4 py-2 text-sm font-semibold text-(--color-app-text-secondary)'>
				{label}
			</div>
			<div className='relative aspect-4/3'>
				<Image
					src={src}
					alt={`${label} image preview`}
					fill
					sizes='(max-width: 768px) 100vw, 560px'
					className='object-contain p-4'
				/>
			</div>
		</div>
	)
}
