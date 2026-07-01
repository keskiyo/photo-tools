import sharp from 'sharp'

import { isSafeImageDimensions, jsonError } from '@/lib/image-validation'

export async function validateImageBufferForProcessing(input: Buffer) {
	const metadata = await sharp(input).metadata()
	const width = metadata.width ?? 0
	const height = metadata.height ?? 0

	if (!isSafeImageDimensions(width, height)) {
		return jsonError(
			'Upload an image up to 6000x6000px and 36 megapixels.',
			400,
		)
	}

	return null
}
