'use client'

import { useTranslations } from 'next-intl'

import { UploadCloud } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useId, useMemo, useState } from 'react'

import { ACCEPTED_IMAGE_TYPES } from '@/lib/image-validation'

type DropzoneProps = {
	file: File | null
	onFileChange: (file: File | null) => void
	disabled?: boolean
}

export function Dropzone({
	file,
	onFileChange,
	disabled = false,
}: DropzoneProps) {
	const inputId = useId()
	const [dragActive, setDragActive] = useState(false)
	const t = useTranslations()
	const previewUrl = useMemo(
		() => (file ? URL.createObjectURL(file) : undefined),
		[file],
	)

	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl)
		}
	}, [previewUrl])

	return (
		<div
			onDragOver={event => {
				event.preventDefault()
				if (!disabled) setDragActive(true)
			}}
			onDragLeave={() => setDragActive(false)}
			onDrop={event => {
				event.preventDefault()
				setDragActive(false)
				if (disabled) return
				onFileChange(event.dataTransfer.files.item(0))
			}}
			className={`rounded-(--radius-card) border-2 border-dashed p-8 text-center transition ${
				dragActive
					? 'border-(--color-app-accent) bg-(--gradient-app-soft)'
					: 'app-dropzone-idle border-(--color-app-border-strong)'
			} ${disabled ? 'opacity-60' : ''}`}
		>
			<input
				id={inputId}
				type='file'
				accept={ACCEPTED_IMAGE_TYPES.join(',')}
				disabled={disabled}
				className='sr-only'
				onChange={event =>
					onFileChange(event.target.files?.item(0) ?? null)
				}
			/>
			<label
				htmlFor={inputId}
				className='focus-ring mx-auto flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-(--radius-control)'
			>
				{previewUrl ? (
					<span className='relative mb-4 block aspect-video w-full overflow-hidden rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface)'>
						<Image
							src={previewUrl}
							alt={file?.name ?? ''}
							fill
							unoptimized
							sizes='(max-width: 768px) 100vw, 520px'
							className='h-full w-full object-contain'
						/>
					</span>
				) : (
					<span className='grid h-14 w-14 place-items-center rounded-2xl bg-(--gradient-app-soft)'>
						<UploadCloud aria-hidden='true' className='h-7 w-7' />
					</span>
				)}
				<span className='text-lg font-semibold'>
					{file ? file.name : t('dropzone.title')}
				</span>
				<span className='mt-2 text-sm text-(--color-app-text-secondary)'>
					{t('dropzone.help')}
				</span>
			</label>
		</div>
	)
}
