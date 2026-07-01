import { Eye, EyeOff, LockKeyhole } from 'lucide-react'

import type { PasswordFieldProps } from '../_types'

/** Password input with a show/hide eye toggle. Shared by auth + reset forms. */
export function PasswordField({
	label,
	placeholder,
	autoComplete,
	registration,
	visible,
	onToggle,
	showLabel,
	hideLabel,
	error,
	errorId,
}: PasswordFieldProps) {
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
						<LockKeyhole aria-hidden='true' />
					</span>
					<input
						{...registration}
						type={visible ? 'text' : 'password'}
						placeholder={placeholder}
						autoComplete={autoComplete}
						aria-invalid={error ? true : undefined}
						aria-describedby={error ? errorId : undefined}
						className='min-w-0 flex-1 bg-transparent text-sm text-(--color-app-text) outline-none placeholder:text-(--color-app-text-muted)'
					/>
					<button
						type='button'
						onClick={onToggle}
						aria-label={visible ? hideLabel : showLabel}
						aria-pressed={visible}
						className='focus-ring grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full text-(--color-app-text-secondary) transition hover:text-(--color-app-text)'
					>
						{visible ? (
							<EyeOff aria-hidden='true' className='h-4 w-4' />
						) : (
							<Eye aria-hidden='true' className='h-4 w-4' />
						)}
					</button>
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
