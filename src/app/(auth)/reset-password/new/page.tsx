import { getTranslations } from 'next-intl/server'

import { redirect } from 'next/navigation'

import { ResetPasswordForm } from '@/app/(auth)/_components/reset-password-form'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

type ResetNewPageProps = {
	searchParams: Promise<{
		email?: string
		token?: string
	}>
}

export default async function ResetNewPage({
	searchParams,
}: ResetNewPageProps) {
	const t = await getTranslations()
	const params = await searchParams

	// Без email/токена шаг смены пароля недоступен — возвращаем на вход.
	if (!params.email || !params.token) {
		redirect('/login')
	}

	return (
		<div className='app-shell'>
			<Navbar />
			<main className='app-container grid min-h-screen place-items-center pt-32 pb-20'>
				<section className='w-full'>
					<p className='mb-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
						{t('auth.reset.eyebrow')}
					</p>
					<ResetPasswordForm
						email={params.email}
						token={params.token}
					/>
				</section>
			</main>
			<Footer />
		</div>
	)
}
