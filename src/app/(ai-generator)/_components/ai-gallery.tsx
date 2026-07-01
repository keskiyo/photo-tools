'use client'

import { useTranslations } from 'next-intl'

import Image from 'next/image'

import type { AiGalleryProps } from '../_types'

export function AiGallery({ images }: AiGalleryProps) {
	const t = useTranslations()

	if (images.length === 0) {
		return (
			<div className='app-surface rounded-(--radius-card) p-8 text-center'>
				<p className='text-lg font-semibold'>
					{t('gallery.empty.title')}
				</p>
				<p className='mt-2 text-sm text-(--color-app-text-secondary)'>
					{t('gallery.empty.description')}
				</p>
			</div>
		)
	}

	return (
		<div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
			{images.map(image => (
				<article
					key={image.id}
					className='app-surface overflow-hidden rounded-(--radius-card)'
				>
					<div className='relative aspect-square'>
						<Image
							src={image.resultUrl}
							alt={image.prompt ?? t('tool.ai.galleryAlt')}
							fill
							className='object-cover'
							unoptimized={image.resultUrl.endsWith('.svg')}
						/>
					</div>
					<div className='p-4'>
						<p className='line-clamp-2 text-sm text-(--color-app-text-secondary)'>
							{image.prompt ?? t('tool.ai.galleryFallback')}
						</p>
					</div>
				</article>
			))}
		</div>
	)
}
