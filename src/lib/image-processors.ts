import sharp from 'sharp'

import { createGeneratedFileName, saveGeneratedFile } from '@/lib/files'
import { removeBackgroundWithPhotoRoom } from '@/lib/photoroom'
import { createProcessedImage } from '@/lib/processed-images'
import { appendPromptLog } from '@/lib/prompt-log'
import type { AiAspectRatio } from '@/lib/tool-schemas'
import type { ProcessedImageType } from '@/types/processed-image'

export type ProcessingOwner = {
	userId?: string | null
	anonymousOwnerId?: string | null
}

export type ConvertPayload = {
	fileName: string
	format: 'jpeg' | 'png' | 'webp'
	width?: number
	height?: number
	quality: number
	preserveAspectRatio: boolean
}

export type BackgroundRemovePayload = {
	fileName: string
	contentType: string
}

export type AiGeneratePayload = {
	prompt: string
	fullPrompt: string
	style: string
	aspectRatio: AiAspectRatio
	actor: string
}

const aspectRatioSize = {
	'1:1': { widthRatio: '1', heightRatio: '1' },
	'16:9': { widthRatio: '16', heightRatio: '9' },
	'9:16': { widthRatio: '9', heightRatio: '16' },
	'4:3': { widthRatio: '4', heightRatio: '3' },
} as const

export async function processConvertImage({
	input,
	payload,
	owner,
}: {
	input: Buffer
	payload: ConvertPayload
	owner: ProcessingOwner
}) {
	let pipeline = sharp(input).rotate()
	if (payload.width || payload.height) {
		pipeline = pipeline.resize({
			width: payload.width,
			height: payload.height,
			fit: payload.preserveAspectRatio ? 'inside' : 'fill',
			withoutEnlargement: true,
		})
	}

	const output =
		payload.format === 'jpeg'
			? await pipeline.jpeg({ quality: payload.quality }).toBuffer()
			: payload.format === 'png'
				? await pipeline.png({ quality: payload.quality }).toBuffer()
				: await pipeline.webp({ quality: payload.quality }).toBuffer()

	const extension = payload.format === 'jpeg' ? 'jpg' : payload.format
	const resultUrl = await saveProcessorOutput('convert', extension, output)
	await createProcessedImage({
		type: 'convert',
		fileName: payload.fileName,
		resultUrl,
		userId: owner.userId,
		anonymousOwnerId: owner.anonymousOwnerId,
	})
	return resultUrl
}

export async function processBackgroundRemoval({
	input,
	payload,
	owner,
}: {
	input: Buffer
	payload: BackgroundRemovePayload
	owner: ProcessingOwner
}) {
	const file = new File([new Uint8Array(input)], payload.fileName, {
		type: payload.contentType,
	})
	const output =
		(await removeBackgroundWithPhotoRoom(file)) ??
		(await removeBackgroundLocally(input))
	const resultUrl = await saveProcessorOutput('bg_remove', 'png', output)
	await createProcessedImage({
		type: 'bg_remove',
		fileName: payload.fileName,
		resultUrl,
		userId: owner.userId,
		anonymousOwnerId: owner.anonymousOwnerId,
	})
	return resultUrl
}

export async function processAiGeneration({
	payload,
	owner,
}: {
	payload: AiGeneratePayload
	owner: ProcessingOwner
}) {
	await appendPromptLog({
		actor: payload.actor,
		userId: owner.userId,
		prompt: payload.prompt,
		type: 'ai_gen',
		style: payload.style,
		aspectRatio: payload.aspectRatio,
	})

	const generated = await tryGenerateWithYandexArt(
		payload.fullPrompt,
		payload.aspectRatio,
	)
	if (!generated && process.env.NODE_ENV === 'production') {
		throw new Error('Image generation is temporarily unavailable.')
	}

	const resultUrl = generated ?? '/phototools-app.png'
	await createProcessedImage({
		type: 'ai_gen',
		prompt: payload.fullPrompt,
		resultUrl,
		userId: owner.userId,
		anonymousOwnerId: owner.anonymousOwnerId,
	})
	return resultUrl
}

async function saveProcessorOutput(
	type: ProcessedImageType,
	extension: string,
	output: Buffer,
) {
	return saveGeneratedFile(createGeneratedFileName(type, extension), output)
}

async function removeBackgroundLocally(input: Buffer): Promise<Buffer> {
	const metadata = await sharp(input).metadata()
	const width = Math.min(metadata.width ?? 1200, 1600)
	const height = Math.min(metadata.height ?? 900, 1600)

	const normalized = await sharp(input)
		.rotate()
		.resize({ width, height, fit: 'inside' })
		.ensureAlpha()
		.png()
		.toBuffer()

	return sharp({
		create: {
			width,
			height,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		},
	})
		.composite([{ input: normalized, gravity: 'center' }])
		.png()
		.toBuffer()
}

async function tryGenerateWithYandexArt(
	prompt: string,
	aspectRatio: keyof typeof aspectRatioSize,
) {
	const apiKey = process.env.YANDEX_GPT_API
	const folderId = process.env.YANDEX_ID
	const configuredModel = process.env.YANDEX_GPT_MODEL

	if (!apiKey || !folderId) return null

	try {
		const modelUri = configuredModel?.startsWith('art://')
			? configuredModel
			: `art://${folderId}/yandex-art/latest`
		const size = aspectRatioSize[aspectRatio]
		const response = await fetchWithTimeout(
			'https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync',
			{
				method: 'POST',
				headers: {
					Authorization: `Api-Key ${apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					modelUri,
					generationOptions: {
						seed: `${Date.now()}`,
						aspectRatio: size,
					},
					messages: [{ text: prompt, weight: 1 }],
				}),
			},
			15_000,
		)

		if (!response.ok) return null
		const operation = (await response.json()) as { id?: string }
		if (!operation.id) return null

		const image = await pollYandexOperation(operation.id, apiKey)
		if (!image) return null

		const buffer = Buffer.from(image, 'base64')
		return saveProcessorOutput('ai_gen', 'jpg', buffer)
	} catch (error) {
		// Log only the message — the raw error may carry auth headers/response bodies.
		console.error(
			'YandexART generation failed',
			error instanceof Error ? error.message : 'unknown error',
		)
		return null
	}
}

async function fetchWithTimeout(
	url: string,
	init: RequestInit,
	timeoutMs: number,
) {
	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), timeoutMs)
	try {
		return await fetch(url, { ...init, signal: controller.signal })
	} finally {
		clearTimeout(timer)
	}
}

async function pollYandexOperation(operationId: string, apiKey: string) {
	// Hard wall-clock cap so a stuck operation fails fast instead of hanging.
	const deadline = Date.now() + 45_000
	for (let attempt = 0; attempt < 12 && Date.now() < deadline; attempt += 1) {
		await new Promise(resolve => setTimeout(resolve, 1_500))
		const response = await fetchWithTimeout(
			`https://operation.api.cloud.yandex.net/operations/${operationId}`,
			{
				headers: { Authorization: `Api-Key ${apiKey}` },
			},
			10_000,
		)
		if (!response.ok) return null

		const operation = (await response.json()) as {
			done?: boolean
			response?: { image?: string }
		}

		if (operation.done) {
			return operation.response?.image ?? null
		}
	}

	return null
}
