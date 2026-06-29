import type { ReactNode } from 'react'

type AuthFieldProps = {
	icon: ReactNode
	label: string
	children: ReactNode
}

export function AuthField({ icon, label, children }: AuthFieldProps) {
	return (
		<label className='focus-within:border-(--color-app-accent)'>
			<span className='sr-only'>{label}</span>
			<span className='flex min-h-12 items-center gap-3 rounded-3xl bg-(--color-app-bg-soft) px-4 text-(--color-app-text-secondary) shadow-[inset_2px_5px_10px_color-mix(in_srgb,var(--color-app-bg)_80%,transparent)]'>
				<span className='h-5 w-5 shrink-0 text-(--color-app-text)'>
					{icon}
				</span>
				{children}
			</span>
		</label>
	)
}
