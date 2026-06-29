'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { Dropzone } from '@/components/tools/dropzone'
import { downloadFile, getDownloadFileName } from '@/lib/download'
import { isAbortError, useAbortableSubmit } from '@/hooks/use-abortable-submit'
import {
	backgroundRemoverSchema,
	type BackgroundRemoverValues,
} from '@/lib/tool-schemas'
import { T, useLocalization } from '@/localization'

import { Image as ImageIcon, Palette, Wand2 } from 'lucide-react'
import { BackgroundRemovalDemo } from './background-removal-demo'
import { BackgroundRemoverWorkspace } from './background-remover-workspace'

type ApiResponse = {
	resultUrl?: string
	error?: string
}

type FlowState = 'idle' | 'processing' | 'ready'

export function BackgroundRemoverForm() {
	const { t } = useLocalization()
	const { begin } = useAbortableSubmit()
	const [file, setFile] = useState<File | null>(null)
	const [sourceUrl, setSourceUrl] = useState<string>()
	const [resultUrl, setResultUrl] = useState<string>()
	const [flowState, setFlowState] = useState<FlowState>('idle')
	const { handleSubmit, setValue, reset } = useForm<BackgroundRemoverValues>({
		defaultValues: {
			fileName: '',
		},
	})

	useEffect(() => {
		return () => {
			if (sourceUrl) URL.revokeObjectURL(sourceUrl)
		}
	}, [sourceUrl])

	function handleFileChange(nextFile: File | null) {
		if (sourceUrl) URL.revokeObjectURL(sourceUrl)
		setFile(nextFile)
		setResultUrl(undefined)
		setFlowState('idle')
		setSourceUrl(nextFile ? URL.createObjectURL(nextFile) : undefined)
		setValue('fileName', nextFile?.name ?? '', { shouldValidate: true })
	}

	async function submit(values: BackgroundRemoverValues) {
		const parsed = backgroundRemoverSchema.safeParse(values)
		if (!parsed.success || !file || !sourceUrl) {
			toast.error(t('common.chooseImage'))
			return
		}

		setFlowState('processing')

		try {
			const formData = new FormData()
			formData.append('file', file)

			const response = await fetch('/api/bg-remove', {
				method: 'POST',
				body: formData,
				signal: begin(),
			})
			const data = (await response.json()) as ApiResponse

			if (!response.ok || !data.resultUrl) {
				throw new Error(data.error ?? t('tool.bg.failed'))
			}

			setResultUrl(data.resultUrl)
			setFlowState('ready')
			toast.success(t('tool.bg.ready'))
		} catch (error) {
			if (isAbortError(error)) return
			toast.error(
				error instanceof Error ? error.message : t('tool.bg.failed'),
			)
			setFlowState('idle')
		}
	}

	function resetFlow() {
		if (sourceUrl) URL.revokeObjectURL(sourceUrl)
		setFile(null)
		setSourceUrl(undefined)
		setResultUrl(undefined)
		setFlowState('idle')
		reset({ fileName: '' })
	}

	async function downloadResult() {
		if (!resultUrl) return
		await downloadFile(
			resultUrl,
			getDownloadFileName(resultUrl, 'background-result.png'),
		)
	}

	if (flowState !== 'idle' && sourceUrl) {
		return (
			<BackgroundRemoverWorkspace
				status={flowState === 'ready' ? 'ready' : 'processing'}
				sourceUrl={sourceUrl}
				resultUrl={resultUrl}
				onDownload={downloadResult}
				onUploadAnother={resetFlow}
			/>
		)
	}

	return (
		<div className='grid items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.8fr)]'>
			<form
				onSubmit={handleSubmit(submit)}
				className='app-surface space-y-6 rounded-(--radius-card) p-6'
			>
				<Dropzone file={file} onFileChange={handleFileChange} />
				<div className='space-y-3 rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface) p-2 text-sm'>
					<h3 className='flex items-center gap-2 font-semibold text-(--color-app-text)'>
						<span className='grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-(--gradient-app-soft) text-(--color-app-accent)'>
							<Wand2 aria-hidden='true' className='h-4 w-4' />
						</span>
						<T k='tool.bg.can.title' />
					</h3>
					<ul className='space-y-2 text-(--color-app-text-secondary)'>
						<li className='flex items-center gap-2'>
							<ImageIcon
								aria-hidden='true'
								className='h-4 w-4 shrink-0 text-(--color-app-accent)'
							/>
							<span>
								<T k='tool.bg.can.removeBg' />
							</span>
						</li>
						<li className='flex items-center gap-2'>
							<Palette
								aria-hidden='true'
								className='h-4 w-4 shrink-0 text-(--color-app-accent)'
							/>
							<span>
								<T k='tool.bg.can.recolor' />
							</span>
						</li>
					</ul>
				</div>
				<button
					type='submit'
					className='focus-ring gradient-button min-h-12 w-full cursor-pointer rounded-(--radius-button) px-5 text-sm font-semibold'
				>
					<T k='tool.bg.submit' />
				</button>
			</form>
			<BackgroundRemovalDemo />
		</div>
	)
}
