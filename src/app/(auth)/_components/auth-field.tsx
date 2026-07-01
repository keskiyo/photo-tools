import type { AuthFieldProps } from '../_types'

export function AuthField({
	icon,
	label,
	children,
	error,
	errorId,
}: AuthFieldProps) {
	return (
		<div className='flex flex-col gap-1'>
			<label className='focus-within:border-(--color-app-accent)'>
				<span className='sr-only'>{label}</span>
				<span
					className={`flex min-h-12 items-center gap-3 rounded-3xl border bg-(--color-app-bg-soft) px-4 text-(--color-app-text-secondary) shadow-[inset_2px_5px_10px_color-mix(in_srgb,var(--color-app-bg)_80%,transparent)] ${
						error
							? 'border-(--color-app-danger)'
							: 'border-transparent'
					}`}
				>
					<span className='h-5 w-5 shrink-0 text-(--color-app-text)'>
						{icon}
					</span>
					{children}
				</span>
			</label>
			{error ? (
				<p
					id={errorId}
					role='alert'
					className='px-4 text-xs text-(--color-app-danger)'
				>
					{error}
				</p>
			) : null}
		</div>
	)
}
