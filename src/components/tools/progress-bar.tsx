type ProgressBarProps = {
	value: number
	label?: string
}

export function ProgressBar({ value, label = 'Processing' }: ProgressBarProps) {
	const safeValue = Math.min(100, Math.max(0, value))

	return (
		<div aria-live='polite'>
			<div className='mb-2 flex items-center justify-between text-sm text-(--color-app-text-secondary)'>
				<span>{label}</span>
				<span>{safeValue}%</span>
			</div>
			<div className='h-3 overflow-hidden rounded-full bg-(--color-app-surface-light)'>
				<div
					className='h-full rounded-full bg-(--gradient-app) transition-all duration-300'
					style={{ width: `${safeValue}%` }}
				/>
			</div>
		</div>
	)
}
