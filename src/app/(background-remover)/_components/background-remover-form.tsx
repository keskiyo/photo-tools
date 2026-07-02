'use client'

import { useTranslations } from 'next-intl'

import { Dropzone } from '@/components/tools/dropzone'

import { Image as ImageIcon, Palette, Wand2 } from 'lucide-react'
import { useBackgroundRemoverFlow } from '../_hooks/use-background-remover-flow'
import { BackgroundRemovalDemo } from './background-removal-demo'
import { BackgroundRemoverWorkspace } from './background-remover-workspace'

export function BackgroundRemoverForm() {
	const t = useTranslations()
	const {
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
	} = useBackgroundRemoverFlow()

	if (flowState !== 'idle' && sourceUrl) {
		return (
			<BackgroundRemoverWorkspace
				status={flowState === 'ready' ? 'ready' : 'processing'}
				sourceUrl={sourceUrl}
				resultUrl={resultUrl}
				backgroundColor={backgroundColor}
				onBackgroundColorChange={setBackgroundColor}
				onDownload={downloadResult}
				onUploadAnother={resetFlow}
			/>
		)
	}

	return (
		<div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.8fr)]">
			<form
				onSubmit={form.handleSubmit(submit)}
				className="app-surface space-y-6 rounded-(--radius-card) p-6"
			>
				<Dropzone file={file} onFileChange={handleFileChange} />
				<div className="space-y-3 rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface) p-2 text-sm">
					<h3 className="flex items-center gap-2 font-semibold text-(--color-app-text)">
						<span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-(--gradient-app-soft) text-(--color-app-accent)">
							<Wand2 aria-hidden="true" className="h-4 w-4" />
						</span>
						{t('tool.bg.can.title')}
					</h3>
					<ul className="space-y-2 text-(--color-app-text-secondary)">
						<li className="flex items-center gap-2">
							<ImageIcon
								aria-hidden="true"
								className="h-4 w-4 shrink-0 text-(--color-app-accent)"
							/>
							<span>{t('tool.bg.can.removeBg')}</span>
						</li>
						<li className="flex items-center gap-2">
							<Palette
								aria-hidden="true"
								className="h-4 w-4 shrink-0 text-(--color-app-accent)"
							/>
							<span>{t('tool.bg.can.recolor')}</span>
						</li>
					</ul>
				</div>
				<button
					type="submit"
					className="focus-ring gradient-button min-h-12 w-full cursor-pointer rounded-(--radius-button) px-5 text-sm font-semibold"
				>
					{t('tool.bg.submit')}
				</button>
			</form>
			<BackgroundRemovalDemo />
		</div>
	)
}
