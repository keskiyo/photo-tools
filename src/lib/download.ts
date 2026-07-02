/** Derives a download filename from a result URL, with a fallback. */
export function getDownloadFileName(
	url: string,
	fallback = 'phototools-result',
): string {
	const fileName = url.split('/').pop()?.split('?')[0]
	return fileName || fallback
}

/** Fetches a URL and triggers a browser download. Client-only. */
export async function downloadFile(
	url: string,
	fileName: string,
): Promise<void> {
	const response = await fetch(getDownloadProxyUrl(url, fileName))
	if (!response.ok) {
		throw new Error('Could not download the file.')
	}
	const blob = await response.blob()
	downloadBlob(blob, fileName)
}

export type DownloadImageFormat = 'png' | 'webp' | 'jpg'

/** Fetches an image, optionally places it on a color, and downloads the chosen format. */
export async function downloadImageAs(
	url: string,
	fileName: string,
	format: DownloadImageFormat,
	backgroundColor?: string,
): Promise<void> {
	const response = await fetch(url)
	const blob = await response.blob()
	const image = await createImageBitmap(blob)
	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')

	if (!context) {
		throw new Error('Canvas is unavailable.')
	}

	canvas.width = image.width
	canvas.height = image.height

	if (backgroundColor || format === 'jpg') {
		context.fillStyle = backgroundColor ?? '#ffffff'
		context.fillRect(0, 0, canvas.width, canvas.height)
	}

	context.drawImage(image, 0, 0)
	image.close()

	const outputBlob = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(nextBlob => {
			if (nextBlob) {
				resolve(nextBlob)
				return
			}

			reject(new Error('Could not prepare the image.'))
		}, getMimeType(format))
	})

	downloadBlob(outputBlob, withImageExtension(fileName, format))
}

function downloadBlob(blob: Blob, fileName: string) {
	const objectUrl = URL.createObjectURL(blob)
	const link = document.createElement('a')

	link.href = objectUrl
	link.download = fileName
	document.body.append(link)
	link.click()
	link.remove()
	URL.revokeObjectURL(objectUrl)
}

function getMimeType(format: DownloadImageFormat) {
	return format === 'jpg' ? 'image/jpeg' : `image/${format}`
}

function withImageExtension(fileName: string, format: DownloadImageFormat) {
	return `${fileName.replace(/\.[^.]+$/, '')}.${format}`
}

function getDownloadProxyUrl(url: string, fileName: string) {
	const params = new URLSearchParams({
		filename: fileName,
		url,
	})
	return `/api/download?${params.toString()}`
}
