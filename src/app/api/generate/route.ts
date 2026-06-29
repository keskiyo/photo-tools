import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'

import {
	ANONYMOUS_OWNER_COOKIE,
	createAnonymousOwnerId,
} from '@/lib/anonymous-owner'
import { LEGACY_ANONYMOUS_OWNER_COOKIE } from '@/lib/app-cookies'
import { auth } from '@/lib/auth'
import { createGeneratedFileName, saveGeneratedFile } from '@/lib/files'
import { jsonError } from '@/lib/image-validation'
import { createProcessedImage } from '@/lib/processed-images'
import { appendPromptLog, resolveLogActor } from '@/lib/prompt-log'
import { rateLimiter, resolveRateKey } from '@/lib/rate-limit'
import { generateRequestSchema } from '@/lib/tool-schemas'
import { requestLimits, requestLimitWindowMs } from '@/setting/settings'

const YANDEX_START_TIMEOUT_MS = 15_000
const YANDEX_POLL_TIMEOUT_MS = 10_000
const YANDEX_POLL_ATTEMPTS = 12
const YANDEX_POLL_INTERVAL_MS = 1_500

const stylePrompts: Record<string, string> = {
	product: 'clean product photography, studio lighting, sharp focus',
	cinematic:
		'cinematic lighting, dramatic mood, film still, shallow depth of field',
	editorial: 'editorial magazine photography, refined composition',
	minimal: 'minimalist, clean background, lots of negative space',
	portrait:
		'portrait photography, soft natural light, detailed facial features',
	anime: 'anime style, vibrant colors, cel shading',
	watercolor: 'watercolor painting, soft brush strokes, paper texture',
	render3d: '3D render, octane render, physically based materials',
	vintage: 'vintage retro aesthetic, faded film grain, warm tones',
	cyberpunk: 'cyberpunk, neon lights, futuristic, high contrast',
	fantasy: 'fantasy art, epic, magical atmosphere, highly detailed',
	popart: 'pop art style, bold colors, comic halftone',
}

const aspectRatioSize = {
	'1:1': { widthRatio: '1', heightRatio: '1' },
	'16:9': { widthRatio: '16', heightRatio: '9' },
	'9:16': { widthRatio: '9', heightRatio: '16' },
	'4:3': { widthRatio: '4', heightRatio: '3' },
} as const

export async function POST(request: Request) {
	try {
		const requestHeaders = await headers()
		const cookieStore = await cookies()
		const session = await auth.api.getSession({ headers: requestHeaders })
		const currentAnonymousOwnerId = cookieStore.get(
			ANONYMOUS_OWNER_COOKIE,
		)?.value
		const existingAnonymousOwnerId =
			currentAnonymousOwnerId ??
			cookieStore.get(LEGACY_ANONYMOUS_OWNER_COOKIE)?.value
		const anonymousOwnerId = session?.user?.id
			? null
			: existingAnonymousOwnerId || createAnonymousOwnerId()

		// Gate without spending the budget — a request is only counted once a real
		// image comes back (see rateLimiter.record below).
		const rateKey = resolveRateKey(
			'generate',
			requestHeaders,
			session?.user?.id,
		)
		const gate = rateLimiter.peek(
			rateKey,
			requestLimits.aiGeneration,
			requestLimitWindowMs,
		)
		if (!gate.ok) {
			return jsonError(
				'Too many generations. Please try again later.',
				429,
			)
		}

		const body = await request.json().catch(() => null)
		const parsed = generateRequestSchema.safeParse(body)
		if (!parsed.success) {
			return jsonError(
				'Provide a prompt of at least 8 characters and a valid style.',
			)
		}

		const { prompt, style, aspectRatio } = parsed.data
		const stylePhrase = stylePrompts[style]
		const fullPrompt = stylePhrase
			? `${prompt}. Style: ${stylePhrase}.`
			: prompt

		await appendPromptLog({
			actor: resolveLogActor(session?.user),
			userId: session?.user?.id ?? null,
			prompt,
			type: 'ai_gen',
			style,
			aspectRatio,
		})
		const generated = await tryGenerateWithYandexArt(
			fullPrompt,
			aspectRatio,
		)

		// In production a missing result means a real outage; don't silently serve
		// the placeholder image and hide it. Locally, fall back so the UI still works.
		if (!generated && process.env.NODE_ENV === 'production') {
			return jsonError(
				'Image generation is temporarily unavailable. Please try again later.',
				503,
			)
		}

		// Only a real generated image spends the budget. The dev mock fallback does
		// not count (the AI did not actually produce a result).
		if (generated) {
			rateLimiter.record(rateKey, requestLimitWindowMs)
		}

		const resultUrl = generated ?? createMockGeneratedImage()

		await createProcessedImage({
			type: 'ai_gen',
			prompt: fullPrompt,
			resultUrl,
			userId: session?.user?.id ?? null,
			anonymousOwnerId,
		})

		const response = NextResponse.json({ resultUrl })
		if (anonymousOwnerId && !currentAnonymousOwnerId) {
			response.cookies.set(ANONYMOUS_OWNER_COOKIE, anonymousOwnerId, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 30,
				path: '/',
				sameSite: 'lax',
			})
		}
		response.cookies.delete(LEGACY_ANONYMOUS_OWNER_COOKIE)

		return response
	} catch (error) {
		console.error('Generate route failed', error)
		return jsonError('Could not generate image.', 500)
	}
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
			YANDEX_START_TIMEOUT_MS,
		)

		if (!response.ok) {
			console.error('YandexART start failed', { status: response.status })
			return null
		}

		const operation = (await response.json()) as { id?: string }
		if (!operation.id) return null

		const image = await pollYandexOperation(operation.id, apiKey)
		if (!image) {
			console.error('YandexART polling produced no image', {
				operationId: operation.id,
			})
			return null
		}

		const buffer = Buffer.from(image, 'base64')
		const fileName = createGeneratedFileName('ai_gen', 'jpg')
		return saveGeneratedFile(fileName, buffer)
	} catch (error) {
		console.error('YandexART generation failed, using fallback', error)
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
	for (let attempt = 0; attempt < YANDEX_POLL_ATTEMPTS; attempt += 1) {
		await new Promise(resolve =>
			setTimeout(resolve, YANDEX_POLL_INTERVAL_MS),
		)
		const response = await fetchWithTimeout(
			`https://operation.api.cloud.yandex.net/operations/${operationId}`,
			{
				headers: { Authorization: `Api-Key ${apiKey}` },
			},
			YANDEX_POLL_TIMEOUT_MS,
		)
		if (!response.ok) {
			console.error('YandexART poll failed', {
				status: response.status,
				operationId,
			})
			return null
		}

		const operation = (await response.json()) as {
			done?: boolean
			response?: { image?: string }
		}

		if (operation.done) {
			return operation.response?.image ?? null
		}
	}

	console.error('YandexART polling timed out', { operationId })
	return null
}

function createMockGeneratedImage() {
	return '/phototools-app.png'
}
