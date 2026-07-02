'use client'

import { useTranslations } from 'next-intl'

import { UserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { authClient } from '@/lib/auth-client'

type ProfileMenuProps = {
	className?: string
	displayName: string
	email: string
	isAdmin?: boolean
	onNavigate?: () => void
}

export function ProfileMenu({
	className = '',
	displayName,
	email,
	isAdmin = false,
	onNavigate,
}: ProfileMenuProps) {
	const t = useTranslations()
	const router = useRouter()
	const menuRef = useRef<HTMLDivElement>(null)
	const [isOpen, setIsOpen] = useState(false)
	const [isSigningOut, setIsSigningOut] = useState(false)

	useEffect(() => {
		if (!isOpen) return

		function handlePointerDown(event: PointerEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') setIsOpen(false)
		}

		document.addEventListener('pointerdown', handlePointerDown)
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen])

	async function signOut() {
		setIsSigningOut(true)
		await authClient.signOut()
		setIsOpen(false)
		onNavigate?.()
		router.push('/login')
		router.refresh()
	}

	return (
		<div ref={menuRef} className={`relative ${className}`}>
			<button
				type="button"
				onClick={() => setIsOpen(open => !open)}
				aria-expanded={isOpen}
				className="focus-ring inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-(--radius-button) border border-(--color-app-border) px-4 text-sm font-semibold text-(--color-app-text-secondary) transition-colors hover:bg-(--color-app-surface-light) hover:text-(--color-app-text)"
			>
				<UserRound aria-hidden="true" className="h-4 w-4" />
				<span className="max-w-36 truncate">{displayName}</span>
			</button>

			{isOpen ? (
				<div className="absolute right-0 top-[calc(100%+0.55rem)] z-1000 w-64 rounded-(--radius-card) border border-(--color-app-border) bg-(--color-app-surface) p-3 shadow-(--shadow-card)">
					<p className="truncate px-2 py-2 text-sm font-bold text-(--color-app-text)">
						{email}
					</p>
					<div className="mt-1 grid gap-1">
						<Link
							href="/profile"
							onClick={() => {
								setIsOpen(false)
								onNavigate?.()
							}}
							className="focus-ring rounded-(--radius-button) px-3 py-2 text-sm font-semibold text-(--color-app-text-secondary) transition hover:bg-(--color-app-surface-light) hover:text-(--color-app-text)"
						>
							{t('auth.profile.menuProfile')}
						</Link>
						{isAdmin ? (
							<Link
								href="/admin"
								onClick={() => {
									setIsOpen(false)
									onNavigate?.()
								}}
								className="focus-ring rounded-(--radius-button) px-3 py-2 text-sm font-semibold text-(--color-app-accent) transition hover:bg-(--color-app-surface-light)"
							>
								{t('auth.profile.menuAdmin')}
							</Link>
						) : null}
						<button
							type="button"
							onClick={signOut}
							disabled={isSigningOut}
							className="focus-ring cursor-pointer rounded-(--radius-button) px-3 py-2 text-left text-sm font-semibold text-(--color-app-text-secondary) transition hover:bg-(--color-app-surface-light) hover:text-(--color-app-text) disabled:cursor-not-allowed disabled:text-(--color-app-text-muted)"
						>
							{t('auth.profile.signOut')}
						</button>
					</div>
				</div>
			) : null}
		</div>
	)
}
