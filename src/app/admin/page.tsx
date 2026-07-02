import { getTranslations } from 'next-intl/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { auth, isAdminUser } from '@/lib/auth'

import { AdminUsersTable } from './_components/admin-users-table'

export default async function AdminPage() {
	const requestHeaders = await headers()
	const session = await auth.api.getSession({ headers: requestHeaders })

	if (!session) redirect('/login')
	if (!isAdminUser(session.user.id)) redirect('/')

	const { users } = await auth.api.listUsers({
		headers: requestHeaders,
		query: { limit: 200, sortBy: 'createdAt', sortDirection: 'desc' },
	})

	const t = await getTranslations('admin')

	return (
		<div className="app-shell">
			<Navbar />
			<main className="app-container min-h-screen pt-32 pb-20">
				<p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)">
					{t('eyebrow')}
				</p>
				<h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
					{t('title')}
				</h1>
				<p className="mt-3 max-w-2xl text-base text-(--color-app-text-secondary)">
					{t('subtitle')}
				</p>

				<AdminUsersTable
					currentUserId={session.user.id}
					users={users.map(user => ({
						id: user.id,
						name: user.name,
						email: user.email,
						role: user.role ?? 'user',
						banned: Boolean(user.banned),
						createdAt: new Date(user.createdAt).toISOString(),
					}))}
				/>
			</main>
			<Footer />
		</div>
	)
}
