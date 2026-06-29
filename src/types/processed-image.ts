export type ProcessedImageType = 'bg_remove' | 'convert' | 'ai_gen'

export type ProcessedImageRecord = {
	id: string
	type: ProcessedImageType
	prompt: string | null
	fileName: string | null
	resultUrl: string
	userId: string | null
	anonymousOwnerId: string | null
	createdAt: Date
}
