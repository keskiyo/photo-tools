'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

type NumberStepperProps = {
	label: ReactNode
	inputProps: UseFormRegisterReturn
	placeholder: string
	increaseLabel: string
	decreaseLabel: string
	onValueChange: (value: string) => void
	onIncrement: () => void
	onDecrement: () => void
}

export function NumberStepper({
	label,
	inputProps,
	placeholder,
	increaseLabel,
	decreaseLabel,
	onValueChange,
	onIncrement,
	onDecrement,
}: NumberStepperProps) {
	const { onChange, ...restInputProps } = inputProps

	return (
		<label className='grid gap-2 text-sm font-semibold'>
			{label}
			<span className='relative block'>
				<input
					{...restInputProps}
					type='number'
					min='1'
					placeholder={placeholder}
					onChange={event => {
						void onChange(event)
						onValueChange(event.target.value)
					}}
					className='number-input focus-ring min-h-12 w-full rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface) px-4 pr-12'
				/>
				<span className='absolute top-1/2 right-2 grid -translate-y-1/2 overflow-hidden rounded-[10px] border border-(--color-app-border) bg-(--color-app-bg-soft)'>
					<button
						type='button'
						onClick={onIncrement}
						aria-label={increaseLabel}
						className='grid h-5 w-7 cursor-pointer place-items-center text-(--color-app-text-secondary) transition hover:bg-(--color-app-surface-light) hover:text-(--color-app-text)'
					>
						<ChevronUp aria-hidden='true' className='h-3.5 w-3.5' />
					</button>
					<button
						type='button'
						onClick={onDecrement}
						aria-label={decreaseLabel}
						className='grid h-5 w-7 cursor-pointer place-items-center border-t border-(--color-app-border) text-(--color-app-text-secondary) transition hover:bg-(--color-app-surface-light) hover:text-(--color-app-text)'
					>
						<ChevronDown
							aria-hidden='true'
							className='h-3.5 w-3.5'
						/>
					</button>
				</span>
			</span>
		</label>
	)
}
