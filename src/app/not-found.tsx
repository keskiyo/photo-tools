import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { ButtonLink } from '@/components/ui/button-link'
import { T } from '@/localization'

export default function NotFound() {
	return (
		<div className='app-shell'>
			<Navbar />
			<main className='app-container grid min-h-screen place-items-center pt-28 pb-20'>
				<section className='app-surface-strong mx-auto max-w-2xl rounded-(--radius-card) p-8 text-center md:p-12'>
					<p className='mt-8 text-7xl font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
						<T k='notFound.eyebrow' />
					</p>
					<h1 className='mt-4 text-4xl font-bold tracking-tight md:text-6xl'>
						<T k='notFound.title' />
					</h1>
					<p className='mx-auto mt-5 max-w-xl text-base leading-7 text-(--color-app-text-secondary)'>
						<T k='notFound.description' />
					</p>
					<div className='mt-8 flex flex-col justify-center gap-4 sm:flex-row'>
						<ButtonLink href='/'>
							<T k='notFound.home' />
						</ButtonLink>
						<ButtonLink href='/converter' variant='secondary'>
							<T k='notFound.converter' />
						</ButtonLink>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	)
}
