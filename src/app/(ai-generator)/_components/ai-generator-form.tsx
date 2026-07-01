'use client'

import { useTranslations } from 'next-intl'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { ResultPanel } from '@/components/tools/result-panel'
import { isAbortError, useAbortableSubmit } from '@/hooks/use-abortable-submit'
import { resolveJobResult } from '@/hooks/use-processing-job'
import { generateRequestSchema } from '@/lib/tool-schemas'

import type { AiGeneratorApiResponse, GeneratorValues } from '../_types'

const generatorSchema = generateRequestSchema

export function AiGeneratorForm() {
	const t = useTranslations()
	const { begin } = useAbortableSubmit()
	const [resultUrl, setResultUrl] = useState<string>()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { register, handleSubmit } = useForm<GeneratorValues>({
		defaultValues: {
			prompt: '',
			style: 'none',
			aspectRatio: '1:1',
		},
	})

	async function onSubmit(values: GeneratorValues) {
		const parsed = generatorSchema.safeParse(values)
		if (!parsed.success) {
			toast.error(t('tool.ai.promptTooShort'))
			return
		}

		setIsSubmitting(true)
		try {
			const signal = begin()
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(parsed.data),
				signal,
			})
			const data = (await response.json()) as AiGeneratorApiResponse

			if (!response.ok) {
				throw new Error(data.error ?? t('tool.ai.failed'))
			}

			setResultUrl(
				await resolveJobResult(data, {
					fallbackError: t('tool.ai.failed'),
					signal,
				}),
			)
			toast.success(t('tool.ai.ready'))
		} catch (error) {
			if (isAbortError(error)) return
			toast.error(
				error instanceof Error ? error.message : t('tool.ai.failed'),
			)
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
				<label className='grid gap-2 text-sm font-semibold'>
					{t('tool.ai.prompt')}
					<textarea
						{...register('prompt')}
						rows={7}
						placeholder={t('tool.ai.placeholder')}
						className='focus-ring resize-none rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface) p-4 leading-6'
					/>
				</label>
				<div className='grid gap-4 sm:grid-cols-2'>
					<label className='grid gap-2 text-sm font-semibold'>
						{t('tool.ai.style.label')}
						<select
							{...register('style')}
							className='focus-ring min-h-12 rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface) px-4'
						>
							<option value='none'>
								{t('tool.ai.style.none')}
							</option>
							<option value='product'>
								{t('tool.ai.style.product')}
							</option>
							<option value='cinematic'>
								{t('tool.ai.style.cinematic')}
							</option>
							<option value='editorial'>
								{t('tool.ai.style.editorial')}
							</option>
							<option value='minimal'>
								{t('tool.ai.style.minimal')}
							</option>
							<option value='portrait'>
								{t('tool.ai.style.portrait')}
							</option>
							<option value='anime'>
								{t('tool.ai.style.anime')}
							</option>
							<option value='watercolor'>
								{t('tool.ai.style.watercolor')}
							</option>
							<option value='render3d'>
								{t('tool.ai.style.render3d')}
							</option>
							<option value='vintage'>
								{t('tool.ai.style.vintage')}
							</option>
							<option value='cyberpunk'>
								{t('tool.ai.style.cyberpunk')}
							</option>
							<option value='fantasy'>
								{t('tool.ai.style.fantasy')}
							</option>
							<option value='popart'>
								{t('tool.ai.style.popart')}
							</option>
						</select>
					</label>
					<label className='grid gap-2 text-sm font-semibold'>
						{t('tool.ai.aspect')}
						<select
							{...register('aspectRatio')}
							className='focus-ring min-h-12 rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface) px-4'
						>
							<option value='1:1'>1:1</option>
							<option value='16:9'>16:9</option>
							<option value='9:16'>9:16</option>
							<option value='4:3'>4:3</option>
						</select>
					</label>
				</div>
				{isSubmitting ? (
					<div className='space-y-3' aria-live='polite'>
						<div className='h-4 w-40 animate-pulse rounded-full bg-(--color-app-surface-light)' />
						<div className='h-32 animate-pulse rounded-(--radius-control) bg-(--gradient-app-soft)' />
					</div>
				) : null}
				<button
					type='submit'
					disabled={isSubmitting}
					className='focus-ring gradient-button min-h-12 w-full cursor-pointer rounded-(--radius-button) px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60'
				>
					{t('tool.ai.submit')}
				</button>
			</form>
			<ResultPanel
				title={t('tool.ai.result')}
				resultUrl={resultUrl}
			/>
		</div>
	)
}
