import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

/** Loading skeleton for tool routes (keeps page chrome stable during fetch). */
export function ToolPageSkeleton() {
	return (
		<div className='app-shell'>
			<Navbar />
			<main className='app-container min-h-screen pt-32 pb-20'>
				<div className='mb-10 max-w-3xl space-y-4'>
					<div className='h-4 w-40 animate-pulse rounded-full bg-(--color-app-surface-light)' />
					<div className='h-12 w-2/3 animate-pulse rounded-2xl bg-(--color-app-surface-light)' />
					<div className='h-5 w-1/2 animate-pulse rounded-full bg-(--color-app-surface-light)' />
				</div>
				<div className='grid gap-8 lg:grid-cols-2'>
					<div className='h-80 animate-pulse rounded-(--radius-card) bg-(--color-app-surface)' />
					<div className='h-80 animate-pulse rounded-(--radius-card) bg-(--color-app-surface)' />
				</div>
			</main>
			<Footer />
		</div>
	)
}
