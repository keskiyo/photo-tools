import type { JobCapableResponse } from '@/lib/job-client'
import type { GenerateRequest } from '@/lib/tool-schemas'
import type { ProcessedImageRecord } from '@/types/processed-image'

export type AiGalleryProps = {
	images: ProcessedImageRecord[]
}

export type GeneratorValues = GenerateRequest

export type AiGeneratorApiResponse = JobCapableResponse
