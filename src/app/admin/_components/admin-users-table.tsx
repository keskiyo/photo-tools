'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { authClient } from '@/lib/auth-client'

export type AdminUser = {
	id: string
	name: string
	email: string
	role: string
	banned: boolean
	createdAt: string
}

export function AdminUsersTable({
	currentUserId,
	users,
}: {
	currentUserId: string
	users: AdminUser[]
}) {
	const t = useTranslations('admin')
	const format = useFormatter()
	const router = useRouter()
	const [pendingId, setPendingId] = useState<string | null>(null)

	async function toggleBan(user: AdminUser) {
		setPendingId(user.id)
		try {
			const action = user.banned
				? authClient.admin.unbanUser({ userId: user.id })
				: authClient.admin.banUser({ userId: user.id })
			const { error } = await action
			if (error) {
				toast.error(error.message ?? t('error'))
				return
			}
			toast.success(user.banned ? t('unbanned') : t('banned'))
			router.refresh()
		} catch {
			toast.error(t('error'))
		} finally {
			setPendingId(null)
		}
	}

	if (users.length === 0) {
		return (
			<p className="app-surface mt-10 rounded-(--radius-card) p-6 text-(--color-app-text-secondary)">
				{t('empty')}
			</p>
		)
	}

	return (
		<div className="app-surface mt-10 overflow-x-auto rounded-(--radius-card)">
			<table className="w-full border-collapse text-left text-sm">
				<thead>
					<tr className="border-b border-(--color-app-border) text-(--color-app-text-muted)">
						<th className="px-5 py-4 font-semibold">{t('colName')}</th>
						<th className="px-5 py-4 font-semibold">{t('colEmail')}</th>
						<th className="px-5 py-4 font-semibold">{t('colRole')}</th>
						<th className="px-5 py-4 font-semibold">{t('colStatus')}</th>
						<th className="px-5 py-4 font-semibold">{t('colRegistered')}</th>
						<th className="px-5 py-4 text-right font-semibold">
							{t('colActions')}
						</th>
					</tr>
				</thead>
				<tbody>
					{users.map(user => {
						const isSelf = user.id === currentUserId
						return (
							<tr
								key={user.id}
								className="border-b border-(--color-app-border) last:border-0"
							>
								<td className="px-5 py-4 font-medium text-(--color-app-text)">
									{user.name}
								</td>
								<td className="px-5 py-4 text-(--color-app-text-secondary)">
									{user.email}
								</td>
								<td className="px-5 py-4">
									<span
										className={`rounded-(--radius-button) px-2.5 py-1 text-xs font-bold ${
											user.role === 'admin'
												? 'bg-(--gradient-app-soft) text-(--color-app-accent)'
												: 'text-(--color-app-text-secondary)'
										}`}
									>
										{user.role === 'admin' ? t('roleAdmin') : t('roleUser')}
									</span>
								</td>
								<td className="px-5 py-4">
									<span
										className={`inline-flex items-center gap-2 text-xs font-semibold ${
											user.banned
												? 'text-(--color-app-accent-warm)'
												: 'text-(--color-app-success)'
										}`}
									>
										<span
											aria-hidden="true"
											className={`h-2 w-2 rounded-full ${
												user.banned
													? 'bg-(--color-app-accent-warm)'
													: 'bg-(--color-app-success)'
											}`}
										/>
										{user.banned ? t('blocked') : t('active')}
									</span>
								</td>
								<td className="px-5 py-4 text-(--color-app-text-secondary)">
									{format.dateTime(new Date(user.createdAt), {
										dateStyle: 'medium',
									})}
								</td>
								<td className="px-5 py-4 text-right">
									{isSelf ? (
										<span className="text-xs text-(--color-app-text-muted)">
											{t('self')}
										</span>
									) : (
										<button
											type="button"
											onClick={() => toggleBan(user)}
											disabled={pendingId === user.id}
											className={`focus-ring cursor-pointer rounded-(--radius-button) border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
												user.banned
													? 'border-(--color-app-border-strong) text-(--color-app-text) hover:bg-(--color-app-surface-light)'
													: 'border-[color-mix(in_srgb,var(--color-app-accent-warm)_45%,transparent)] text-(--color-app-accent-warm) hover:bg-[color-mix(in_srgb,var(--color-app-accent-warm)_12%,transparent)]'
											}`}
										>
											{user.banned ? t('unblock') : t('block')}
										</button>
									)}
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
