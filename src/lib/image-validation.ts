import { NextResponse } from 'next/server'

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024
/** File cap plus a margin for multipart boundary overhead, for an early reject. */
export const MAX_UPLOAD_BYTES = MAX_IMAGE_SIZE + 1024 * 1024
export const MAX_IMAGE_WIDTH = 6000
export const MAX_IMAGE_HEIGHT = 6000
export const MAX_IMAGE_PIXELS = 36_000_000

export type ApiSuccess = {
	resultUrl: string
}

export function jsonError(message: string, status = 400) {
	return NextResponse.json({ error: message }, { status })
}

/**
 * Rejects oversized uploads from the Content-Length header before the body is
 * buffered into memory. Absent/invalid header falls through to the per-file check.
 */
export function isUploadTooLarge(headers: Headers) {
	const raw = headers.get('content-length')
	if (!raw) return false
	const length = Number.parseInt(raw, 10)
	return Number.isFinite(length) && length > MAX_UPLOAD_BYTES
}

export function isSupportedImage(file: File) {
	return (
		ACCEPTED_IMAGE_TYPES.includes(file.type) &&
		file.size > 0 &&
		file.size <= MAX_IMAGE_SIZE
	)
}

export function isSafeImageDimensions(width: number, height: number) {
	return (
		Number.isFinite(width) &&
		Number.isFinite(height) &&
		width > 0 &&
		height > 0 &&
		width <= MAX_IMAGE_WIDTH &&
		height <= MAX_IMAGE_HEIGHT &&
		width * height <= MAX_IMAGE_PIXELS
	)
}

export function parseOptionalInt(value: FormDataEntryValue | null) {
	if (typeof value !== 'string' || value.trim() === '') return undefined
	const parsed = Number.parseInt(value, 10)
	return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function parseQuality(value: FormDataEntryValue | null) {
	if (typeof value !== 'string') return 85
	const parsed = Number.parseInt(value, 10)
	if (!Number.isFinite(parsed)) return 85
	return Math.min(100, Math.max(1, parsed))
}
