import { getTranslations } from 'next-intl/server'

import { ResetVerifyForm } from '@/app/(auth)/_components/reset-verify-form'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

type ResetVerifyPageProps = {
	searchParams: Promise<{
		email?: string
	}>
}

export default async function ResetVerifyPage({
	searchParams,
}: ResetVerifyPageProps) {
	const t = await getTranslations()
	const params = await searchParams

	return (
		<div className='app-shell'>
			<Navbar />
			<main className='app-container grid min-h-screen place-items-center pt-32 pb-20'>
				<section className='w-full'>
					<p className='mb-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
						{t('auth.reset.eyebrow')}
					</p>
					<ResetVerifyForm initialEmail={params.email ?? ''} />
				</section>
			</main>
			<Footer />
		</div>
	)
}
