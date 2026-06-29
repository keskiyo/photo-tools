'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { Dropzone } from '@/components/tools/dropzone'
import { ProgressBar } from '@/components/tools/progress-bar'
import { ResultPanel } from '@/components/tools/result-panel'
import { isAbortError, useAbortableSubmit } from '@/hooks/use-abortable-submit'
import {
	converterSchema,
	type ConverterFormValues,
} from '@/lib/tool-schemas'
import { T, useLocalization } from '@/localization'

import { useConverterDimensions } from '../_hooks/use-converter-dimensions'
import { NumberStepper } from './number-stepper'

type ApiResponse = {
	resultUrl?: string
	error?: string
}

export function ConverterForm() {
	const { t } = useLocalization()
	const { begin } = useAbortableSubmit()
	const [file, setFile] = useState<File | null>(null)
	const [resultUrl, setResultUrl] = useState<string>()
	const [sourceSize, setSourceSize] = useState<{
		width: number
		height: number
	} | null>(null)
	const [progress, setProgress] = useState(0)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { register, handleSubmit, setValue, getValues } =
		useForm<ConverterFormValues>({
			defaultValues: {
				format: 'webp',
				width: '',
				height: '',
				preserveAspectRatio: true,
			},
		})
	const { updateDimension, stepDimension } = useConverterDimensions({
		sourceSize,
		setValue,
		getValues,
	})

	function handleFileChange(nextFile: File | null) {
		setFile(nextFile)
		setResultUrl(undefined)

		if (!nextFile) {
			setSourceSize(null)
			setValue('width', '')
			setValue('height', '')
			return
		}

		const objectUrl = URL.createObjectURL(nextFile)
		const image = new Image()

		image.onload = () => {
			setSourceSize({
				width: image.naturalWidth,
				height: image.naturalHeight,
			})
			setValue('width', image.naturalWidth, {
				shouldDirty: true,
				shouldValidate: true,
			})
			setValue('height', image.naturalHeight, {
				shouldDirty: true,
				shouldValidate: true,
			})
			URL.revokeObjectURL(objectUrl)
		}
		image.onerror = () => URL.revokeObjectURL(objectUrl)
		image.src = objectUrl
	}

	async function onSubmit(values: ConverterFormValues) {
		if (!file) {
			toast.error(t('common.chooseImage'))
			return
		}

		const parsed = converterSchema.safeParse(values)
		if (!parsed.success) {
			toast.error(t('common.checkSettings'))
			return
		}

		setIsSubmitting(true)
		setProgress(20)

		try {
			const formData = new FormData()
			formData.append('file', file)
			formData.append('format', parsed.data.format)
			formData.append(
				'preserveAspectRatio',
				String(parsed.data.preserveAspectRatio),
			)
			if (parsed.data.width)
				formData.append('width', String(parsed.data.width))
			if (parsed.data.height)
				formData.append('height', String(parsed.data.height))

			setProgress(55)
			const response = await fetch('/api/convert', {
				method: 'POST',
				body: formData,
				signal: begin(),
			})
			const data = (await response.json()) as ApiResponse

			if (!response.ok || !data.resultUrl) {
				throw new Error(data.error ?? t('tool.converter.failed'))
			}

			setResultUrl(data.resultUrl)
			setProgress(100)
			toast.success(t('tool.converter.ready'))
		} catch (error) {
			if (isAbortError(error)) return
			toast.error(
				error instanceof Error
					? error.message
					: t('tool.converter.failed'),
			)
			setProgress(0)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='grid gap-8 lg:grid-cols-[0.95fr_1.05fr]'>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='app-surface space-y-6 rounded-(--radius-card) p-6'
			>
				<Dropzone
					file={file}
					onFileChange={handleFileChange}
					disabled={isSubmitting}
				/>
				<div className='grid gap-4 sm:grid-cols-2'>
					<label className='grid gap-2 text-sm font-semibold'>
						<T k='tool.converter.outputFormat' />
						<select
							{...register('format')}
							className='focus-ring min-h-12 rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface) px-4 text-(--color-app-text)'
						>
							<option value='webp'>WEBP</option>
							<option value='jpeg'>JPEG</option>
							<option value='png'>PNG</option>
						</select>
					</label>
					<label className='grid gap-2 text-sm font-semibold'>
						<T k='tool.converter.proportions' />
						<span className='flex min-h-12 items-center gap-3 rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface) px-4'>
							<input
								{...register('preserveAspectRatio')}
								type='checkbox'
								className='h-4 w-4 cursor-pointer rounded border-(--color-app-border) accent-(--color-app-accent)'
							/>
							<T k='tool.converter.preserveAspectRatio' />
						</span>
					</label>
					<NumberStepper
						label={<T k='tool.converter.width' />}
						inputProps={register('width')}
						placeholder={t('tool.converter.auto')}
						increaseLabel={t('common.increase')}
						decreaseLabel={t('common.decrease')}
						onValueChange={value => updateDimension('width', value)}
						onIncrement={() => stepDimension('width', 1)}
						onDecrement={() => stepDimension('width', -1)}
					/>
					<NumberStepper
						label={<T k='tool.converter.height' />}
						inputProps={register('height')}
						placeholder={t('tool.converter.auto')}
						increaseLabel={t('common.increase')}
						decreaseLabel={t('common.decrease')}
						onValueChange={value =>
							updateDimension('height', value)
						}
						onIncrement={() => stepDimension('height', 1)}
						onDecrement={() => stepDimension('height', -1)}
					/>
				</div>
				{isSubmitting ? (
					<ProgressBar
						value={progress}
						label={t('tool.converter.progress')}
					/>
				) : null}
				<button
					type='submit'
					disabled={isSubmitting}
					className='focus-ring gradient-button min-h-12 w-full cursor-pointer rounded-(--radius-button) px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60'
				>
					<T k='tool.converter.submit' />
				</button>
			</form>
			<ResultPanel
				title={<T k='tool.converter.result' />}
				resultUrl={resultUrl}
			/>
		</div>
	)
}
