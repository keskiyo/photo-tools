'use client'

import { ArrowLeftRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { useLocalization } from '@/localization'

type DemoSample = {
	key: 'people' | 'animals' | 'objects' | 'scene'
	labelKey:
		| 'tool.bg.demo.people'
		| 'tool.bg.demo.animals'
		| 'tool.bg.demo.objects'
		| 'tool.bg.demo.scene'
	src: string
	cutSrc: string
}

const demoSamples: DemoSample[] = [
	{
		key: 'people',
		labelKey: 'tool.bg.demo.people',
		src: '/demo/bg-demo-people.png',
		cutSrc: '/demo/bg-demo-people-cut.png',
	},
	{
		key: 'animals',
		labelKey: 'tool.bg.demo.animals',
		src: '/demo/bg-demo-animal.png',
		cutSrc: '/demo/bg-demo-animal-cut.png',
	},
	{
		key: 'objects',
		labelKey: 'tool.bg.demo.objects',
		src: '/demo/bg-demo-object.png',
		cutSrc: '/demo/bg-demo-object-cut.png',
	},
	{
		key: 'scene',
		labelKey: 'tool.bg.demo.scene',
		src: '/demo/bg-demo-scene.png',
		cutSrc: '/demo/bg-demo-scene-cut.png',
	},
]

export function BackgroundRemovalDemo() {
	const { t } = useLocalization()
	const [activeKey, setActiveKey] = useState<DemoSample['key']>('people')
	const [position, setPosition] = useState(50)
	const activeSample =
		demoSamples.find(sample => sample.key === activeKey) ?? demoSamples[0]

	return (
		<aside className='mx-auto w-full max-w-xl'>
			<div className='relative aspect-4/3 overflow-hidden rounded-[1.75rem] bg-(--color-bg-editor-surface) shadow-[0_24px_70px_var(--color-bg-editor-shadow)]'>
				{/* Правый слой: «после» — вырез на прозрачном фоне поверх шахматки.
				    Шахматку задаём inline-стилем: надёжнее, чем Tailwind arbitrary-значение. */}
				<div
					className='absolute inset-0'
					style={{
						backgroundColor: '#ffffff',
						backgroundImage:
							'conic-gradient(#c4c9d0 25%, #ffffff 0 50%, #c4c9d0 0 75%, #ffffff 0)',
						backgroundSize: '24px 24px',
					}}
					aria-hidden='true'
				/>
				<Image
					src={activeSample.cutSrc}
					alt={t('tool.bg.resultPreview')}
					fill
					sizes='(max-width: 1024px) 100vw, 520px'
					className='object-cover'
					priority
				/>
				{/* Левый слой: оригинал, обрезанный по позиции ползунка */}
				<Image
					src={activeSample.src}
					alt={t('tool.bg.demo.beforeAlt')}
					fill
					sizes='(max-width: 1024px) 100vw, 520px'
					className='object-cover'
					style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
					priority
				/>
				<div
					className='absolute inset-y-0 w-0.5 bg-(--color-app-text)'
					style={{ left: `${position}%` }}
					aria-hidden='true'
				/>
				<span
					className='pointer-events-none absolute top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-(--color-app-text) text-(--color-app-accent-strong) shadow-[0_12px_30px_var(--color-bg-editor-shadow)]'
					style={{ left: `${position}%` }}
					aria-hidden='true'
				>
					<ArrowLeftRight className='h-5 w-5' />
				</span>
				<input
					type='range'
					min='8'
					max='92'
					value={position}
					onChange={event => setPosition(Number(event.target.value))}
					aria-label={t('tool.bg.demo.slider')}
					className='absolute inset-0 h-full w-full cursor-ew-resize opacity-0'
				/>
			</div>
			<div className='mt-6 flex flex-wrap justify-center gap-x-5 gap-y-3'>
				{demoSamples.map(sample => {
					const isActive = sample.key === activeKey

					return (
						<button
							key={sample.key}
							type='button'
							onClick={() => {
								setActiveKey(sample.key)
								setPosition(50)
							}}
							className={`focus-ring border-b-2 pb-1 text-sm font-bold transition md:text-base ${
								isActive
									? 'border-(--color-app-accent-strong) text-(--color-app-accent-strong)'
									: 'border-transparent text-(--color-app-text-secondary) hover:text-(--color-app-text)'
							}`}
						>
							{t(sample.labelKey)}
						</button>
					)
				})}
			</div>
		</aside>
	)
}
