/** Derives a download filename from a result URL, with a fallback. */
export function getDownloadFileName(
	url: string,
	fallback = 'phototools-result',
): string {
	const fileName = url.split('/').pop()?.split('?')[0]
	return fileName || fallback
}

/** Fetches a URL and triggers a browser download. Client-only. */
export async function downloadFile(url: string, fileName: string): Promise<void> {
	const response = await fetch(url)
	const blob = await response.blob()
	const objectUrl = URL.createObjectURL(blob)
	const link = document.createElement('a')

	link.href = objectUrl
	link.download = fileName
	document.body.append(link)
	link.click()
	link.remove()
	URL.revokeObjectURL(objectUrl)
}
