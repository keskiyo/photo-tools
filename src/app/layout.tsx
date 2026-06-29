import { YandexMetrika } from '@/components/analytics/yandex-metrika'
import { CookieConsent } from '@/components/layout/cookie-consent'
import {
	COOKIE_CONSENT_COOKIE,
	GEO_LANGUAGE_COOKIE,
	LEGACY_COOKIE_CONSENT_COOKIE,
	LEGACY_GEO_LANGUAGE_COOKIE,
	LEGACY_UI_LANGUAGE_COOKIE,
	UI_LANGUAGE_COOKIE,
} from '@/lib/app-cookies'
import { LocalizationProvider, type Locale } from '@/localization'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cookies, headers } from 'next/headers'
import NextTopLoader from 'nextjs-toploader'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
})

const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

export const metadata: Metadata = {
	title: 'PhotoTools - AI image utilities',
	description:
		'Remove backgrounds, convert images, and generate AI visuals in one polished workspace.',
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const initialLocale = await getInitialLocale()
	const showCookieConsent = await shouldShowCookieConsent()

	return (
		<html
			lang={initialLocale === 'ru' ? 'ru' : 'en'}
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
				<LocalizationProvider initialLocale={initialLocale}>
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
				</LocalizationProvider>
			</body>
		</html>
	)
}

async function getInitialLocale(): Promise<Locale> {
	const cookieStore = await cookies()
	const storedLanguage = normalizeLocale(
		cookieStore.get(UI_LANGUAGE_COOKIE)?.value ??
			cookieStore.get(LEGACY_UI_LANGUAGE_COOKIE)?.value,
	)
	if (storedLanguage) return storedLanguage

	const geoLanguage = normalizeLocale(
		cookieStore.get(GEO_LANGUAGE_COOKIE)?.value ??
			cookieStore.get(LEGACY_GEO_LANGUAGE_COOKIE)?.value,
	)
	if (geoLanguage) return geoLanguage

	const headerStore = await headers()
	const acceptLanguage =
		headerStore.get('accept-language')?.toLowerCase() ?? ''
	return acceptLanguage.includes('ru') ? 'ru' : 'eu'
}

function normalizeLocale(value: string | undefined): Locale | null {
	return value === 'ru' || value === 'eu' ? value : null
}

async function shouldShowCookieConsent() {
	const cookieStore = await cookies()
	return !(
		cookieStore.get(COOKIE_CONSENT_COOKIE)?.value ??
		cookieStore.get(LEGACY_COOKIE_CONSENT_COOKIE)?.value
	)
}
