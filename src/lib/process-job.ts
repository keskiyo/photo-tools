import { z } from 'zod'

import {
	processAiGeneration,
	processBackgroundRemoval,
	processConvertImage,
} from '@/lib/image-processors'
import {
	getProcessingJob,
	markProcessingJobCompleted,
	markProcessingJobFailed,
	markProcessingJobStarted,
} from '@/lib/processing-jobs'
import { readStorageFile } from '@/lib/storage'
import { AI_ASPECT_RATIOS } from '@/lib/tool-schemas'

// Payloads are stored as JSON in the DB; validate before use so a corrupt or
// tampered row fails with a clear error instead of crashing mid-processing.
const convertPayloadSchema = z.object({
	fileName: z.string(),
	format: z.enum(['jpeg', 'png', 'webp']),
	width: z.number().int().positive().optional(),
	height: z.number().int().positive().optional(),
	quality: z.number(),
	preserveAspectRatio: z.boolean(),
})

const backgroundRemovePayloadSchema = z.object({
	fileName: z.string(),
	contentType: z.string(),
})

const aiGeneratePayloadSchema = z.object({
	prompt: z.string(),
	fullPrompt: z.string(),
	style: z.string(),
	aspectRatio: z.enum(AI_ASPECT_RATIOS),
	actor: z.string(),
})

function parsePayload<T>(schema: z.ZodType<T>, payload: unknown): T {
	const result = schema.safeParse(payload)
	if (!result.success) {
		throw new Error('Processing job has an invalid payload.')
	}
	return result.data
}

export async function processJobById(id: string) {
	const job = await getProcessingJob(id)
	if (!job) throw new Error(`Processing job not found: ${id}`)

	await markProcessingJobStarted(id)

	try {
		const owner = {
			userId: job.userId,
			anonymousOwnerId: job.anonymousOwnerId,
		}
		const resultUrl =
			job.type === 'convert'
				? await processConvertImage({
						input: await readRequiredInput(job.inputKey),
						payload: parsePayload(convertPayloadSchema, job.payload),
						owner,
					})
				: job.type === 'bg_remove'
					? await processBackgroundRemoval({
							input: await readRequiredInput(job.inputKey),
							payload: parsePayload(
								backgroundRemovePayloadSchema,
								job.payload,
							),
							owner,
						})
					: await processAiGeneration({
							payload: parsePayload(
								aiGeneratePayloadSchema,
								job.payload,
							),
							owner,
						})

		return markProcessingJobCompleted({ id, resultUrl })
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Processing failed.'
		await markProcessingJobFailed({ id, error: message })
		throw error
	}
}

async function readRequiredInput(inputKey: string | null) {
	if (!inputKey) throw new Error('Processing job is missing inputKey.')
	return readStorageFile(inputKey)
}
