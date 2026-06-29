import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import type { UseFormRegisterReturn } from 'react-hook-form'

type PasswordFieldProps = {
	label: string
	placeholder: string
	autoComplete: string
	registration: UseFormRegisterReturn
	visible: boolean
	onToggle: () => void
	showLabel: string
	hideLabel: string
}

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
}: PasswordFieldProps) {
	return (
		<label className='focus-within:border-(--color-app-accent)'>
			<span className='sr-only'>{label}</span>
			<span className='flex min-h-12 items-center gap-3 rounded-3xl bg-(--color-app-bg-soft) px-4 text-(--color-app-text-secondary) shadow-[inset_2px_5px_10px_color-mix(in_srgb,var(--color-app-bg)_80%,transparent)]'>
				<span className='h-5 w-5 shrink-0 text-(--color-app-text)'>
					<LockKeyhole aria-hidden='true' />
				</span>
				<input
					{...registration}
					type={visible ? 'text' : 'password'}
					placeholder={placeholder}
					autoComplete={autoComplete}
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
	)
}
