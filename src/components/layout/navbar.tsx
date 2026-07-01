'use client'

import { useTranslations } from 'next-intl'

import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { LanguageSelect } from '@/components/layout/language-select'
import { authClient } from '@/lib/auth-client'

const navItems = [
	{ href: '/background-remover', labelKey: 'nav.bgRemover' },
	{ href: '/converter', labelKey: 'nav.converter' },
	{ href: '/ai-generator', labelKey: 'nav.aiGenerator' },
] as const

export function Navbar() {
	const pathname = usePathname() ?? '/'
	const { data: session } = authClient.useSession()
	const t = useTranslations()
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	return (
		<header className="fixed inset-x-0 top-0 z-50 border-b border-(--color-app-border) bg-[color-mix(in_srgb,var(--color-app-bg)_82%,transparent)] backdrop-blur-2xl">
			<nav
				className="app-container flex h-20 items-center justify-between gap-4"
				aria-label={t('nav.main')}
			>
				<BrandLink />
				<DesktopNav pathname={pathname} />
				<div className="flex items-center gap-2 sm:gap-3">
					<LanguageSelect />
					<AuthLink
						isSession={Boolean(session)}
						className="hidden md:inline-flex"
					/>
					<button
						type="button"
						onClick={() => setIsMenuOpen(open => !open)}
						aria-label={t('nav.menu')}
						aria-controls="mobile-navigation"
						aria-expanded={isMenuOpen}
						className="focus-ring grid h-11 w-11 cursor-pointer place-items-center rounded-(--radius-button) border border-(--color-app-border) bg-(--color-app-surface) text-(--color-app-text) transition-colors hover:bg-(--color-app-surface-light) md:hidden"
					>
						{isMenuOpen ? (
							<X aria-hidden="true" className="h-5 w-5" />
						) : (
							<Menu aria-hidden="true" className="h-5 w-5" />
						)}
					</button>
				</div>
			</nav>
			<MobileNav
				isOpen={isMenuOpen}
				onNavigate={() => setIsMenuOpen(false)}
				pathname={pathname}
				isSession={Boolean(session)}
			/>
		</header>
	)
}

function BrandLink() {
	return (
		<Link
			href="/"
			className="focus-ring flex min-w-0 items-center gap-3 rounded-(--radius-button)"
		>
			<Image
				src="/phototools-app.png"
				alt="PhotoTools logo"
				width={42}
				height={42}
				className="rounded-xl"
				priority
			/>
			<span className="truncate text-lg font-semibold tracking-tight">
				PhotoTools
			</span>
		</Link>
	)
}

function DesktopNav({ pathname }: { pathname: string }) {
	return (
		<div className="hidden items-center gap-3 md:flex">
			{navItems.map(item => (
				<NavItemLink key={item.href} item={item} pathname={pathname} />
			))}
		</div>
	)
}

function MobileNav({
	isOpen,
	isSession,
	onNavigate,
	pathname,
}: {
	isOpen: boolean
	isSession: boolean
	onNavigate: () => void
	pathname: string
}) {
	if (!isOpen) return null

	return (
		<div id="mobile-navigation" className="app-container pb-4 md:hidden">
			<div className="app-surface-strong grid gap-2 rounded-(--radius-card) p-3 shadow-(--shadow-card)">
				{navItems.map(item => (
					<NavItemLink
						key={item.href}
						item={item}
						onNavigate={onNavigate}
						pathname={pathname}
						className="justify-start px-4 py-3 text-base"
					/>
				))}
				<AuthLink
					isSession={isSession}
					onNavigate={onNavigate}
					className="mt-2 inline-flex w-full"
				/>
			</div>
		</div>
	)
}

function NavItemLink({
	className = '',
	item,
	onNavigate,
	pathname,
}: {
	className?: string
	item: (typeof navItems)[number]
	onNavigate?: () => void
	pathname: string
}) {
	const t = useTranslations()
	const isActive =
		pathname === item.href || pathname.startsWith(`${item.href}/`)

	return (
		<Link
			href={item.href}
			onClick={onNavigate}
			aria-current={isActive ? 'page' : undefined}
			className={`focus-ring inline-flex rounded-(--radius-button) px-3 py-2 text-sm font-medium transition-colors ${
				isActive
					? 'bg-(--gradient-app-soft) text-(--color-app-text) shadow-(--shadow-glow)'
					: 'text-(--color-app-text-secondary) hover:bg-(--color-app-surface-light) hover:text-(--color-app-text)'
			} ${className}`}
		>
			{t(item.labelKey)}
		</Link>
	)
}

function AuthLink({
	className = '',
	isSession,
	onNavigate,
}: {
	className?: string
	isSession: boolean
	onNavigate?: () => void
}) {
	const t = useTranslations()

	return (
		<Link
			href={isSession ? '/profile' : '/login'}
			onClick={onNavigate}
			className={`focus-ring min-h-11 items-center justify-center rounded-(--radius-button) px-4 text-sm font-semibold transition-colors ${
				isSession
					? 'border border-(--color-app-border) text-(--color-app-text-secondary) hover:bg-(--color-app-surface-light) hover:text-(--color-app-text)'
					: 'gradient-button gradient-button-glow text-(--color-app-text)'
			} ${className}`}
		>
			{isSession ? t('nav.profile') : t('nav.login')}
		</Link>
	)
}
