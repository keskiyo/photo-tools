import { HomeCapabilities } from '@/app/_components/home-capabilities'
import { HomeFaq } from '@/app/_components/home-faq'
import { HomeFinalCta } from '@/app/_components/home-final-cta'
import { HomeHero } from '@/app/_components/home-hero'
import { HomePricing } from '@/app/_components/home-pricing'
import { HomeTools } from '@/app/_components/home-tools'
import { HomeWorkflow } from '@/app/_components/home-workflow'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

export default function Home() {
	return (
		<div className='app-shell'>
			<Navbar />
			<main className='pt-20'>
				<HomeHero />
				<HomeTools />
				<HomeWorkflow />
				<HomeCapabilities />
				<HomePricing />
				<HomeFaq />
				<HomeFinalCta />
			</main>
			<Footer />
		</div>
	)
}
