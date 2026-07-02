'use client'

import { useTranslations } from 'next-intl'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { isAbortError, useAbortableSubmit } from '@/hooks/use-abortable-submit'
import { resolveJobResult } from '@/lib/job-client'
import { converterSchema, type ConverterFormValues } from '@/lib/tool-schemas'

import type { ConverterApiResponse } from '../_types'
import { useConverterDimensions } from './use-converter-dimensions'

export function useConverterFlow() {
	const t = useTranslations()
	const { begin } = useAbortableSubmit()
	const [file, setFile] = useState<File | null>(null)
	const [resultUrl, setResultUrl] = useState<string>()
	const [sourceSize, setSourceSize] = useState<{
		width: number
		height: number
	} | null>(null)
	const [progress, setProgress] = useState(0)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const form = useForm<ConverterFormValues>({
		defaultValues: {
			format: 'webp',
			width: '',
			height: '',
			preserveAspectRatio: true,
		},
	})
	const { updateDimension, stepDimension } = useConverterDimensions({
		sourceSize,
		setValue: form.setValue,
		getValues: form.getValues,
	})

	function handleFileChange(nextFile: File | null) {
		setFile(nextFile)
		setResultUrl(undefined)

		if (!nextFile) {
			setSourceSize(null)
			form.setValue('width', '')
			form.setValue('height', '')
			return
		}

		const objectUrl = URL.createObjectURL(nextFile)
		const image = new Image()

		image.onload = () => {
			setSourceSize({
				width: image.naturalWidth,
				height: image.naturalHeight,
			})
			form.setValue('width', image.naturalWidth, {
				shouldDirty: true,
				shouldValidate: true,
			})
			form.setValue('height', image.naturalHeight, {
				shouldDirty: true,
				shouldValidate: true,
			})
			URL.revokeObjectURL(objectUrl)
		}
		image.onerror = () => URL.revokeObjectURL(objectUrl)
		image.src = objectUrl
	}

	async function submit(values: ConverterFormValues) {
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

			setProgress(35)
			const signal = begin()
			const response = await fetch('/api/convert', {
				method: 'POST',
				body: formData,
				signal,
			})
			const data = (await response.json()) as ConverterApiResponse

			if (!response.ok) {
				throw new Error(data.error ?? t('tool.converter.failed'))
			}

			const resultUrl = await resolveJobResult(data, {
				fallbackError: t('tool.converter.failed'),
				signal,
				onProgress: value => setProgress(Math.max(35, value)),
			})
			setResultUrl(resultUrl)
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

	return {
		file,
		form,
		handleFileChange,
		isSubmitting,
		progress,
		resultUrl,
		stepDimension,
		submit,
		updateDimension,
	}
}
