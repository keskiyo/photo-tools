import { NextResponse } from 'next/server'

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024

export type ApiSuccess = {
	resultUrl: string
}

export function jsonError(message: string, status = 400) {
	return NextResponse.json({ error: message }, { status })
}

export function isSupportedImage(file: File) {
	return (
		ACCEPTED_IMAGE_TYPES.includes(file.type) &&
		file.size > 0 &&
		file.size <= MAX_IMAGE_SIZE
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
