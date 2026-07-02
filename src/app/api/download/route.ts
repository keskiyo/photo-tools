import { NextResponse } from 'next/server'

import { getAllowedDownloadUrl } from '@/lib/download-source'

export async function GET(request: Request) {
	const requestUrl = new URL(request.url)
	const source = requestUrl.searchParams.get('url')
	const fileName = sanitizeFileName(
		requestUrl.searchParams.get('filename') ?? 'phototools-result',
	)

	if (!source) {
		return NextResponse.json(
			{ error: 'Missing download URL.' },
			{ status: 400 },
		)
	}

	const targetUrl = getAllowedDownloadUrl(source, requestUrl.origin)

	if (!targetUrl) {
		return NextResponse.json(
			{ error: 'Download URL is not allowed.' },
			{ status: 400 },
		)
	}

	const response = await fetch(targetUrl, { cache: 'no-store' })

	if (!response.ok || !response.body) {
		return NextResponse.json(
			{ error: 'Could not fetch file.' },
			{ status: 502 },
		)
	}

	return new Response(response.body, {
		headers: {
			'Cache-Control': 'private, no-store',
			'Content-Disposition': `attachment; filename="${fileName}"`,
			'Content-Type':
				response.headers.get('content-type') ?? 'application/octet-stream',
		},
		status: 200,
	})
}

function sanitizeFileName(fileName: string) {
	return (
		fileName.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') ||
		'phototools-result'
	)
}
