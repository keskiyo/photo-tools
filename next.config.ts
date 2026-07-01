import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
const storageImagePatterns = buildStorageImagePatterns()

const securityHeaders = [
	{ key: 'X-Content-Type-Options', value: 'nosniff' },
	{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
	{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
	{
		key: 'Permissions-Policy',
		value: 'camera=(), microphone=(), geolocation=()',
	},
	// HSTS only meaningful over HTTPS; safe to send and ignored on http://localhost.
	{
		key: 'Strict-Transport-Security',
		value: 'max-age=63072000; includeSubDomains; preload',
	},
	// Report-only first so real breakage surfaces in the console before enforcing.
	// Promote to 'Content-Security-Policy' once verified against the live domain.
	{
		key: 'Content-Security-Policy-Report-Only',
		value: buildContentSecurityPolicy(),
	},
]

const nextConfig: NextConfig = {
	reactCompiler: true,
	poweredByHeader: false,
	images: {
		remotePatterns: storageImagePatterns,
	},
	async headers() {
		return [
			{
				source: '/:path*',
				headers: securityHeaders,
			},
		]
	},
}

export default withNextIntl(nextConfig)

function buildContentSecurityPolicy(): string {
	// Public storage origin (S3/Yandex) that serves result/upload images.
	const storageOrigins = new Set<string>()
	const publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL
	if (publicBaseUrl) {
		try {
			storageOrigins.add(new URL(publicBaseUrl).origin)
		} catch {
			// Ignore invalid env; fallback host below still covers Yandex S3.
		}
	}
	storageOrigins.add('https://storage.yandexcloud.net')

	const storage = [...storageOrigins].join(' ')
	// Yandex Metrika (analytics) endpoints, loaded only when a counter id is set.
	const metrika = 'https://mc.yandex.ru https://mc.yandex.com'

	const directives = [
		`default-src 'self'`,
		`base-uri 'self'`,
		`object-src 'none'`,
		`frame-ancestors 'self'`,
		`form-action 'self'`,
		`img-src 'self' data: blob: ${storage} ${metrika}`,
		// Next.js hydration + React Compiler emit inline scripts.
		`script-src 'self' 'unsafe-inline' ${metrika} https://yastatic.net`,
		// Tailwind and react-toastify inject inline styles.
		`style-src 'self' 'unsafe-inline'`,
		`font-src 'self' data:`,
		`connect-src 'self' ${storage} ${metrika} https://mc.webvisor.com`,
		`frame-src ${metrika}`,
	]

	return directives.join('; ')
}

function buildStorageImagePatterns(): NonNullable<
	NextConfig['images']
>['remotePatterns'] {
	const patterns: NonNullable<NextConfig['images']>['remotePatterns'] = []
	const publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL

	if (publicBaseUrl) {
		try {
			const url = new URL(publicBaseUrl)
			patterns.push({
				protocol: url.protocol.replace(':', '') as 'http' | 'https',
				hostname: url.hostname,
				port: url.port,
				pathname: `${url.pathname.replace(/\/+$/, '')}/**`,
			})
		} catch {
			// Invalid env should not break local dev; fallback below covers Yandex S3.
		}
	}

	if (process.env.S3_BUCKET) {
		patterns.push({
			protocol: 'https',
			hostname: 'storage.yandexcloud.net',
			pathname: `/${process.env.S3_BUCKET}/**`,
		})
	}

	return patterns
}
