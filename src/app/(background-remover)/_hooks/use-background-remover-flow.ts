'use client'

import { useTranslations } from 'next-intl'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { isAbortError, useAbortableSubmit } from '@/hooks/use-abortable-submit'
import { resolveJobResult } from '@/lib/job-client'
import { downloadImageAs, getDownloadFileName } from '@/lib/download'
import {
	backgroundRemoverSchema,
	type BackgroundRemoverValues,
} from '@/lib/tool-schemas'

import type { BgRemoveApiResponse, DownloadFormat, FlowState } from '../_types'

export function useBackgroundRemoverFlow() {
	const t = useTranslations()
	const { begin } = useAbortableSubmit()
	const [file, setFile] = useState<File | null>(null)
	const [sourceUrl, setSourceUrl] = useState<string>()
	const [resultUrl, setResultUrl] = useState<string>()
	const [backgroundColor, setBackgroundColor] = useState<string>()
	const [flowState, setFlowState] = useState<FlowState>('idle')
	const form = useForm<BackgroundRemoverValues>({
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
		setBackgroundColor(undefined)
		setFlowState('idle')
		setSourceUrl(nextFile ? URL.createObjectURL(nextFile) : undefined)
		form.setValue('fileName', nextFile?.name ?? '', { shouldValidate: true })
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

			const signal = begin()
			const response = await fetch('/api/bg-remove', {
				method: 'POST',
				body: formData,
				signal,
			})
			const data = (await response.json()) as BgRemoveApiResponse

			if (!response.ok) {
				throw new Error(data.error ?? t('tool.bg.failed'))
			}

			const resultUrl = await resolveJobResult(data, {
				fallbackError: t('tool.bg.failed'),
				signal,
			})
			setResultUrl(resultUrl)
			setFlowState('ready')
			toast.success(t('tool.bg.ready'))
		} catch (error) {
			if (isAbortError(error)) return
			toast.error(error instanceof Error ? error.message : t('tool.bg.failed'))
			setFlowState('idle')
		}
	}

	function resetFlow() {
		if (sourceUrl) URL.revokeObjectURL(sourceUrl)
		setFile(null)
		setSourceUrl(undefined)
		setResultUrl(undefined)
		setBackgroundColor(undefined)
		setFlowState('idle')
		form.reset({ fileName: '' })
	}

	async function downloadResult(format: DownloadFormat) {
		if (!resultUrl) return

		const fileName = getDownloadFileName(resultUrl, 'background-result.png')
		await downloadImageAs(resultUrl, fileName, format, backgroundColor)
	}

	return {
		backgroundColor,
		downloadResult,
		file,
		flowState,
		form,
		handleFileChange,
		resetFlow,
		resultUrl,
		setBackgroundColor,
		sourceUrl,
		submit,
	}
}
