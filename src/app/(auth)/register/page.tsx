import { getTranslations } from 'next-intl/server'

import { AuthForm } from '@/app/(auth)/_components/auth-form'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

export default async function RegisterPage() {
	const t = await getTranslations()
	return (
		<div className='app-shell'>
			<Navbar />
			<main className='app-container grid min-h-screen place-items-center pt-32 pb-20'>
				<section className='w-full'>
					<p className='mb-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
						{t('auth.register.eyebrow')}
					</p>
					<AuthForm mode='register' />
				</section>
			</main>
			<Footer />
		</div>
	)
}
