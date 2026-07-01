import { getTranslations } from 'next-intl/server'

import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { auth } from '@/lib/auth'

export default async function ProfilePage() {
	const t = await getTranslations()
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		redirect('/login')
	}

	if (!session.user.emailVerified) {
		redirect(
			`/verify-email?email=${encodeURIComponent(session.user.email)}`,
		)
	}

	return (
		<div className='app-shell'>
			<Navbar />
			<main className='app-container min-h-screen pt-32 pb-20'>
				<section className='app-surface-strong mx-auto max-w-2xl rounded-(--radius-card) p-8'>
					<p className='text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
						{t('auth.profile.eyebrow')}
					</p>
					<h1 className='mt-4 text-4xl font-bold tracking-tight'>
						{session?.user?.name ?? t('auth.profile.fallback')}
					</h1>
					<p className='mt-4 text-(--color-app-text-secondary)'>
						{session?.user?.email}
					</p>
					<Link
						href='/converter'
						className='focus-ring gradient-button mt-8 inline-flex min-h-11 items-center rounded-(--radius-button) px-5 text-sm font-semibold'
					>
						{t('auth.profile.continue')}
					</Link>
				</section>
			</main>
			<Footer />
		</div>
	)
}
