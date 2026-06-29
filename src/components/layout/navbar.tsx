'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { LanguageSelect } from '@/components/layout/language-select'
import { authClient } from '@/lib/auth-client'
import { useLocalization } from '@/localization'

const navItems = [
	{ href: '/background-remover', labelKey: 'nav.bgRemover' },
	{ href: '/converter', labelKey: 'nav.converter' },
	{ href: '/ai-generator', labelKey: 'nav.aiGenerator' },
] as const

export function Navbar() {
	const pathname = usePathname() ?? '/'
	const { data: session } = authClient.useSession()
	const { t } = useLocalization()

	return (
		<header className='fixed inset-x-0 top-0 z-50 border-b border-(--color-app-border) bg-[color-mix(in_srgb,var(--color-app-bg)_82%,transparent)] backdrop-blur-2xl'>
			<nav className='app-container flex h-20 items-center justify-between gap-6'>
				<Link
					href='/'
					className='focus-ring flex items-center gap-3 rounded-(--radius-button)'
				>
					<Image
						src='/phototools-app.png'
						alt='PhotoTools logo'
						width={42}
						height={42}
						className='rounded-xl'
						priority
					/>
					<span className='text-lg font-semibold tracking-tight'>
						PhotoTools
					</span>
				</Link>
				<div className='hidden items-center gap-3 md:flex'>
					{navItems.map(item => {
						const isActive =
							pathname === item.href ||
							pathname.startsWith(`${item.href}/`)

						return (
							<Link
								key={item.href}
								href={item.href}
								aria-current={isActive ? 'page' : undefined}
								className={`focus-ring rounded-(--radius-button) px-3 py-2 text-sm font-medium transition ${
									isActive
										? 'bg-(--gradient-app-soft) text-(--color-app-text) shadow-(--shadow-glow)'
										: 'text-(--color-app-text-secondary) hover:text-(--color-app-text)'
								}`}
							>
								{t(item.labelKey)}
							</Link>
						)
					})}
				</div>
				<div className='flex items-center gap-3'>
					<LanguageSelect />
					<Link
						href={session ? '/profile' : '/login'}
						className={`focus-ring hidden min-h-11 items-center justify-center rounded-(--radius-button) px-4 text-sm font-semibold transition sm:inline-flex ${
							session
								? 'border border-(--color-app-border) text-(--color-app-text-secondary) hover:text-(--color-app-text)'
								: 'gradient-button gradient-button-glow text-(--color-app-text)'
						}`}
					>
						{session ? t('nav.profile') : t('nav.login')}
					</Link>
				</div>
			</nav>
		</header>
	)
}
