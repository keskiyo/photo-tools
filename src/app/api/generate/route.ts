import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'

import {
	ANONYMOUS_OWNER_COOKIE,
	applyAnonymousOwnerCookie,
	createAnonymousOwnerId,
} from '@/lib/anonymous-owner'
import { LEGACY_ANONYMOUS_OWNER_COOKIE } from '@/lib/app-cookies'
import { auth } from '@/lib/auth'
import { consumeDistributedRateLimit } from '@/lib/distributed-rate-limit'
import { processJobById } from '@/lib/process-job'
import {
	createProcessingJob,
	serializeProcessingJob,
} from '@/lib/processing-jobs'
import { enqueueProcessingJob } from '@/lib/processing-queue'
import { resolveLogActor } from '@/lib/prompt-log'
import { resolveRateKey } from '@/lib/rate-limit'
import { jsonError } from '@/lib/image-validation'
import { generateRequestSchema } from '@/lib/tool-schemas'
import { requestLimits, requestLimitWindowMs } from '@/config/limits'

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

		const rateKey = resolveRateKey(
			'generate',
			requestHeaders,
			session?.user?.id,
		)
		const gate = await consumeDistributedRateLimit(
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

		const job = await createProcessingJob({
			type: 'ai_gen',
			userId: session?.user?.id ?? null,
			anonymousOwnerId,
			payload: {
				prompt,
				fullPrompt,
				style,
				aspectRatio,
				actor: resolveLogActor(session?.user),
			},
		})

		const queued = await enqueueProcessingJob(job.id)
		const response = queued
			? NextResponse.json(
					{ jobId: job.id, job: serializeProcessingJob(job) },
					{ status: 202 },
				)
			: NextResponse.json(await runInline(job.id))

		applyAnonymousOwnerCookie(
			response,
			anonymousOwnerId && !currentAnonymousOwnerId
				? anonymousOwnerId
				: null,
		)

		return response
	} catch (error) {
		console.error(
			'Generate route failed',
			error instanceof Error ? error.message : 'unknown error',
		)
		return jsonError('Could not generate image.', 500)
	}
}

async function runInline(id: string) {
	const completed = await processJobById(id)
	return {
		jobId: completed.id,
		resultUrl: completed.resultUrl,
		job: serializeProcessingJob(completed),
	}
}
