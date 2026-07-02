import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { ProfileDashboard } from '@/app/(auth)/_components/profile-dashboard'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { auth } from '@/lib/auth'
import { getRecentProcessedImages } from '@/lib/processed-images'

export default async function ProfilePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		redirect('/login')
	}

	if (!session.user.emailVerified) {
		redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`)
	}

	const historyImages = await getRecentProcessedImages('ai_gen', 60, {
		userId: session.user.id,
	})

	return (
		<div className="app-shell">
			<Navbar />
			<main className="app-container min-h-screen pt-32 pb-20">
				<ProfileDashboard
					user={{
						name: session.user.name,
						email: session.user.email,
					}}
					historyImages={historyImages.map(image => ({
						id: image.id,
						prompt: image.prompt,
						resultUrl: image.resultUrl,
						createdAt: image.createdAt.toISOString(),
					}))}
				/>
			</main>
			<Footer />
		</div>
	)
}
