import type { ReactNode } from 'react'

type AppLoaderProps = {
	label: ReactNode
	className?: string
}

export function AppLoader({ label, className = '' }: AppLoaderProps) {
	return (
		<div
			className={`relative h-12.5 w-20 ${className}`}
			role='status'
			aria-live='polite'
		>
			<span className='absolute top-0 m-0 animate-[loader-text_3.5s_ease_both_infinite] p-0 text-xs tracking-[1px] text-(--color-app-accent)'>
				{label}
			</span>
			<span className="absolute bottom-0 block h-4 w-4 animate-[loader-bar_3.5s_ease_both_infinite] rounded-full bg-(--color-app-accent-strong) before:absolute before:h-full before:w-full before:animate-[loader-bar-inner_3.5s_ease_both_infinite] before:rounded-[inherit] before:bg-(--color-app-accent-warm) before:content-['']" />
		</div>
	)
}
