import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

type ProfileFormFieldProps = {
	autoComplete: string
	error?: FieldError
	label?: string
	placeholder?: string
	registration: UseFormRegisterReturn
	type?: string
}

export function ProfileFormField({
	autoComplete,
	error,
	label,
	placeholder,
	registration,
	type = 'text',
}: ProfileFormFieldProps) {
	const input = (
		<>
			{label ? (
				<span className="text-sm font-semibold text-(--color-app-text-secondary)">
					{label}
				</span>
			) : null}
			<input
				{...registration}
				autoComplete={autoComplete}
				className="mt-2 min-h-12 w-full rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-surface) px-4 text-(--color-app-text) outline-none transition focus:border-(--color-app-accent)"
				placeholder={placeholder}
				type={type}
			/>
			{error?.message ? <FieldError>{error.message}</FieldError> : null}
		</>
	)

	if (!label) {
		return <div>{input}</div>
	}

	return <label className="block">{input}</label>
}

function FieldError({ children }: { children: string }) {
	return <p className="mt-2 text-sm text-(--color-app-danger)">{children}</p>
}
