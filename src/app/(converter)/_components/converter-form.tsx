'use client'

import { useTranslations } from 'next-intl'

import { Dropzone } from '@/components/tools/dropzone'
import { ProgressBar } from '@/components/tools/progress-bar'
import { ResultPanel } from '@/components/tools/result-panel'

import { useConverterFlow } from '../_hooks/use-converter-flow'
import { NumberStepper } from './number-stepper'

export function ConverterForm() {
	const t = useTranslations()
	const {
		file,
		form,
		handleFileChange,
		isSubmitting,
		progress,
		resultUrl,
		stepDimension,
		submit,
		updateDimension,
	} = useConverterFlow()

	return (
		<div className='grid gap-8 lg:grid-cols-[0.95fr_1.05fr]'>
			<form
				onSubmit={form.handleSubmit(submit)}
				className='app-surface space-y-6 rounded-(--radius-card) p-6'
			>
				<Dropzone
					file={file}
					onFileChange={handleFileChange}
					disabled={isSubmitting}
				/>
				<div className='grid gap-4 sm:grid-cols-2'>
					<label className='grid gap-2 text-sm font-semibold'>
						{t('tool.converter.outputFormat')}
						<select
							{...form.register('format')}
							className='app-input focus-ring'
						>
							<option value='webp'>WEBP</option>
							<option value='jpeg'>JPEG</option>
							<option value='png'>PNG</option>
						</select>
					</label>
					<label className='grid gap-2 text-sm font-semibold'>
						{t('tool.converter.proportions')}
						<span className='flex min-h-12 items-center gap-3 rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface) px-4'>
							<input
								{...form.register('preserveAspectRatio')}
								type='checkbox'
								className='h-4 w-4 cursor-pointer rounded border-(--color-app-border) accent-(--color-app-accent)'
							/>
							{t('tool.converter.preserveAspectRatio')}
						</span>
					</label>
					<NumberStepper
						label={t('tool.converter.width')}
						inputProps={form.register('width')}
						placeholder={t('tool.converter.auto')}
						increaseLabel={t('common.increase')}
						decreaseLabel={t('common.decrease')}
						onValueChange={value => updateDimension('width', value)}
						onIncrement={() => stepDimension('width', 1)}
						onDecrement={() => stepDimension('width', -1)}
					/>
					<NumberStepper
						label={t('tool.converter.height')}
						inputProps={form.register('height')}
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
					{t('tool.converter.submit')}
				</button>
			</form>
			<ResultPanel
				title={t('tool.converter.result')}
				resultUrl={resultUrl}
			/>
		</div>
	)
}
