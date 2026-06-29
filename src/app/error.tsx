'use client'

import { TriangleAlert } from 'lucide-react'
import { useEffect } from 'react'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { ButtonLink } from '@/components/ui/button-link'
import { T } from '@/localization'

type ErrorProps = {
	error: Error & { digest?: string }
	reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<div className='app-shell'>
			<Navbar />
			<main className='app-container grid min-h-screen place-items-center pt-28 pb-20'>
				<section className='app-surface-strong mx-auto max-w-2xl rounded-(--radius-card) p-8 text-center md:p-12'>
					<div className='mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-(--gradient-app-soft) text-(--color-app-accent)'>
						<TriangleAlert
							aria-hidden='true'
							className='h-15 w-15'
						/>
					</div>
					<p className='mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-(--color-app-accent)'>
						<T k='error.eyebrow' />
					</p>
					<h1 className='mt-4 text-4xl font-bold tracking-tight md:text-6xl'>
						<T k='error.title' />
					</h1>
					<p className='mx-auto mt-5 max-w-xl text-base leading-7 text-(--color-app-text-secondary)'>
						<T k='error.description' />
					</p>
					<div className='mt-8 flex flex-col justify-center gap-4 sm:flex-row'>
						<button
							type='button'
							onClick={reset}
							className='focus-ring gradient-button inline-flex min-h-12 cursor-pointer items-center justify-center rounded-(--radius-button) px-6 text-sm font-semibold transition hover:-translate-y-0.5'
						>
							<T k='error.retry' />
						</button>
						<ButtonLink href='/' variant='secondary'>
							<T k='error.home' />
						</ButtonLink>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	)
}
