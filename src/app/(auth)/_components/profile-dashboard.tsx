'use client'

import { useTranslations } from 'next-intl'

import { History, LogOut, Settings, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { authClient } from '@/lib/auth-client'

import { ProfileSettingsForm } from './profile-settings-form'
import type {
	ProfileHistoryImage,
	ProfileUser,
	ProfileView,
} from '../_types/profile'

type ProfileDashboardProps = {
	historyImages: ProfileHistoryImage[]
	user: ProfileUser
}

export function ProfileDashboard({
	historyImages,
	user,
}: ProfileDashboardProps) {
	const t = useTranslations()
	const router = useRouter()
	const [activeView, setActiveView] = useState<ProfileView>('settings')
	const [isSigningOut, setIsSigningOut] = useState(false)
	const [profileUser, setProfileUser] = useState(user)

	async function signOut() {
		setIsSigningOut(true)
		await authClient.signOut()
		router.push('/login')
		router.refresh()
	}

	return (
		<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
			<section className="app-surface-strong rounded-(--radius-card) p-6 md:p-8">
				{activeView === 'history' ? (
					<HistoryView images={historyImages} />
				) : (
					<ProfileSettingsForm
						user={profileUser}
						onUserUpdate={setProfileUser}
					/>
				)}
			</section>

			<aside className="app-surface h-fit rounded-(--radius-card) p-5">
				<p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)">
					{t('auth.profile.eyebrow')}
				</p>
				<h2 className="mt-3 text-2xl font-bold tracking-tight">
					{t('auth.profile.sidebarTitle')}
				</h2>
				<p className="mt-3 text-sm text-(--color-app-text-secondary)">
					{profileUser.email}
				</p>
				<div className="mt-6 grid gap-3">
					<SidebarButton
						icon={<History aria-hidden="true" />}
						isActive={activeView === 'history'}
						onClick={() => setActiveView('history')}
					>
						{t('auth.profile.history')}
					</SidebarButton>
					<SidebarButton
						icon={<Settings aria-hidden="true" />}
						isActive={activeView === 'settings'}
						onClick={() => setActiveView('settings')}
					>
						{t('auth.profile.settings')}
					</SidebarButton>
					<SidebarButton
						icon={<LogOut aria-hidden="true" />}
						isDisabled={isSigningOut}
						onClick={signOut}
					>
						{t('auth.profile.signOutAccount')}
					</SidebarButton>
				</div>
			</aside>
		</div>
	)
}

function HistoryView({ images }: { images: ProfileHistoryImage[] }) {
	const t = useTranslations()

	return (
		<div>
			<h1 className="text-3xl font-bold tracking-tight md:text-4xl">
				{t('auth.profile.historyTitle')}
			</h1>
			{images.length === 0 ? (
				<div className="mt-10 rounded-(--radius-card) border border-(--color-app-border) bg-(--color-app-surface) p-8 text-center">
					<Sparkles
						aria-hidden="true"
						className="mx-auto h-9 w-9 text-(--color-app-accent)"
					/>
					<p className="mt-4 text-lg font-semibold">
						{t('auth.profile.historyEmptyTitle')}
					</p>
					<p className="mt-2 text-sm text-(--color-app-text-secondary)">
						{t('auth.profile.historyEmptyDescription')}
					</p>
				</div>
			) : (
				<div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
					{images.map(image => (
						<article
							key={image.id}
							className="app-surface overflow-hidden rounded-(--radius-card)"
						>
							<div className="relative aspect-square">
								<Image
									src={image.resultUrl}
									alt={image.prompt ?? t('tool.ai.galleryAlt')}
									fill
									sizes="(max-width: 768px) 100vw, 280px"
									className="object-cover"
								/>
							</div>
							<div className="p-4">
								<p className="line-clamp-2 text-sm text-(--color-app-text-secondary)">
									{image.prompt ?? t('tool.ai.galleryFallback')}
								</p>
							</div>
						</article>
					))}
				</div>
			)}
		</div>
	)
}

function SidebarButton({
	children,
	icon,
	isActive = false,
	isDisabled = false,
	onClick,
}: {
	children: string
	icon: ReactNode
	isActive?: boolean
	isDisabled?: boolean
	onClick: () => void
}) {
	return (
		<button
			type="button"
			disabled={isDisabled}
			onClick={onClick}
			className={`focus-ring inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 [&>svg]:h-4 [&>svg]:w-4 ${
				isActive
					? 'border-(--color-app-accent) bg-(--gradient-app-soft) text-(--color-app-text)'
					: 'border-(--color-app-border) bg-(--color-app-surface) text-(--color-app-text-secondary) hover:bg-(--color-app-surface-light) hover:text-(--color-app-text)'
			}`}
		>
			{icon}
			{children}
		</button>
	)
}
