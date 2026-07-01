import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'

import { YandexMetrika } from '@/components/analytics/yandex-metrika'
import { CookieConsent } from '@/components/layout/cookie-consent'
import {
	COOKIE_CONSENT_COOKIE,
	LEGACY_COOKIE_CONSENT_COOKIE,
} from '@/lib/app-cookies'
import {
	defaultOgImage,
	siteDescription,
	siteName,
	siteUrl,
} from '@/lib/site'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { cookies } from 'next/headers'
import NextTopLoader from 'nextjs-toploader'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'

// Self-hosted to avoid Google Fonts network fetches at build/dev time.
// InterVariable.woff2 is the variable (weight 100–900) roman font with
// Latin + Cyrillic + Greek glyphs, so Russian UI text renders in Inter too.
const inter = localFont({
	src: './fonts/InterVariable.woff2',
	variable: '--font-inter',
	weight: '100 900',
	display: 'swap',
	fallback: ['Arial', 'Helvetica', 'sans-serif'],
})

const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: 'PhotoTools — AI image utilities',
		template: '%s — PhotoTools',
	},
	description: siteDescription,
	applicationName: siteName,
	alternates: { canonical: '/' },
	openGraph: {
		type: 'website',
		siteName,
		title: 'PhotoTools — AI image utilities',
		description: siteDescription,
		url: siteUrl,
		images: [{ url: defaultOgImage, alt: siteName }],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'PhotoTools — AI image utilities',
		description: siteDescription,
		images: [defaultOgImage],
	},
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const locale = await getLocale()
	const showCookieConsent = await shouldShowCookieConsent()

	return (
		<html
			lang={locale}
			data-scroll-behavior='smooth'
			className={`${inter.variable} h-full antialiased`}
		>
			<body className='min-h-full bg-(--color-app-bg)'>
				<NextTopLoader
					color='#4facfe'
					height={3}
					shadow='0 0 10px #4facfe, 0 0 5px #4facfe'
					showSpinner={false}
				/>
				<NextIntlClientProvider>
					{children}
					<ToastContainer
						theme='dark'
						position='top-right'
						toastClassName='app-toast'
						progressClassName='app-toast-progress'
						closeButton={false}
					/>
					<CookieConsent initialIsVisible={showCookieConsent} />
					<YandexMetrika counterId={yandexMetrikaId} />
				</NextIntlClientProvider>
			</body>
		</html>
	)
}

async function shouldShowCookieConsent() {
	const cookieStore = await cookies()
	return !(
		cookieStore.get(COOKIE_CONSENT_COOKIE)?.value ??
		cookieStore.get(LEGACY_COOKIE_CONSENT_COOKIE)?.value
	)
}
