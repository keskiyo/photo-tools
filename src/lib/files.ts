import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { ProcessedImageType } from '@/types/processed-image'

const GENERATED_DIR = path.join(process.cwd(), 'public', 'generated')

const EXTENSIONS_BY_TYPE = {
	bg_remove: 'png',
	convert: 'webp',
	ai_gen: 'jpg',
} as const satisfies Record<ProcessedImageType, string>

export function createGeneratedFileName(
	type: ProcessedImageType,
	extension?: string,
) {
	const targetExtension = extension ?? EXTENSIONS_BY_TYPE[type]
	const safeExtension = targetExtension
		.replace(/[^a-z0-9]/gi, '')
		.toLowerCase()
	return `${type}-${Date.now()}-${crypto.randomUUID()}.${safeExtension}`
}

export async function saveGeneratedFile(fileName: string, buffer: Buffer) {
	await mkdir(GENERATED_DIR, { recursive: true })
	await writeFile(path.join(GENERATED_DIR, fileName), buffer)
	return `/generated/${fileName}`
}
