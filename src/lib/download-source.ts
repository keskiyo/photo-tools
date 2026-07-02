export function getAllowedDownloadUrl(
	source: string,
	requestOrigin: string,
): URL | null {
	const url = parseDownloadUrl(source, requestOrigin)

	if (!url) return null

	if (url.origin === requestOrigin) {
		return url
	}

	const publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL
	if (publicBaseUrl) {
		const baseUrl = parseDownloadUrl(publicBaseUrl, requestOrigin)
		if (
			baseUrl &&
			url.origin === baseUrl.origin &&
			url.pathname.startsWith(normalizePathPrefix(baseUrl.pathname))
		) {
			return url
		}
	}

	if (
		process.env.S3_BUCKET &&
		url.origin === 'https://storage.yandexcloud.net' &&
		url.pathname.startsWith(`/${process.env.S3_BUCKET}/`)
	) {
		return url
	}

	return null
}

function parseDownloadUrl(source: string, requestOrigin: string) {
	try {
		return new URL(source, requestOrigin)
	} catch {
		return null
	}
}

function normalizePathPrefix(pathname: string) {
	const normalized = pathname.replace(/\/+$/, '')
	return normalized ? `${normalized}/` : '/'
}
