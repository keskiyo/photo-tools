import { VerifyEmailForm } from '@/app/(auth)/_components/verify-email-form'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { T } from '@/localization'

type VerifyEmailPageProps = {
	searchParams: Promise<{
		email?: string
	}>
}

export default async function VerifyEmailPage({
	searchParams,
}: VerifyEmailPageProps) {
	const params = await searchParams

	return (
		<div className='app-shell'>
			<Navbar />
			<main className='app-container grid min-h-screen place-items-center pt-32 pb-20'>
				<section className='w-full'>
					<p className='mb-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
						<T k='auth.verify.eyebrow' />
					</p>
					<VerifyEmailForm initialEmail={params.email ?? ''} />
				</section>
			</main>
			<Footer />
		</div>
	)
}
