import Link from 'next/link'
import type { ReactNode } from 'react'

type ButtonLinkProps = {
	href: string
	children: ReactNode
	variant?: 'primary' | 'secondary'
}

export function ButtonLink({
	href,
	children,
	variant = 'primary',
}: ButtonLinkProps) {
	const className =
		variant === 'primary'
			? 'gradient-button hover:-translate-y-0.5'
			: 'border border-(--color-app-border-strong) bg-[color-mix(in_srgb,var(--color-app-surface)_70%,transparent)] hover:border-(--color-app-border-strong) hover:bg-(--color-app-surface-light)'

	return (
		<Link
			href={href}
			className={`focus-ring inline-flex min-h-12 items-center justify-center rounded-(--radius-button) px-6 text-sm font-semibold transition ${className}`}
		>
			{children}
		</Link>
	)
}
