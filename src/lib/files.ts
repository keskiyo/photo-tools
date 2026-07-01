import {
	buildStorageKey,
	getContentTypeForExtension,
	saveStorageFile,
} from '@/lib/storage'
import type { ProcessedImageType } from '@/types/processed-image'

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
	return buildStorageKey({
		kind: 'generated',
		type,
		extension: targetExtension,
	})
}

export async function saveGeneratedFile(fileName: string, buffer: Buffer) {
	const extension = fileName.split('.').pop() ?? 'bin'
	return saveStorageFile({
		key: fileName,
		buffer,
		contentType: getContentTypeForExtension(extension),
	})
}
