import { NextResponse } from 'next/server'

import {
	applyAnonymousOwnerCookie,
	ensureRequestOwner,
} from '@/lib/anonymous-owner'
import { consumeDistributedRateLimit } from '@/lib/distributed-rate-limit'
import {
	isSupportedImage,
	isUploadTooLarge,
	jsonError,
	parseOptionalInt,
	parseQuality,
} from '@/lib/image-validation'
import { processJobById } from '@/lib/process-job'
import {
	createProcessingJob,
	serializeProcessingJob,
} from '@/lib/processing-jobs'
import { enqueueProcessingJob } from '@/lib/processing-queue'
import { resolveRateKey } from '@/lib/rate-limit'
import { validateImageBufferForProcessing } from '@/lib/server-image-validation'
import { buildStorageKey, saveStorageFile } from '@/lib/storage'
import { requestLimits, requestLimitWindowMs } from '@/setting/settings'

const OUTPUT_FORMATS = ['jpeg', 'png', 'webp'] as const
type OutputFormat = (typeof OUTPUT_FORMATS)[number]

export async function POST(request: Request) {
	try {
		const rateKey = resolveRateKey('convert', request.headers)
		const gate = await consumeDistributedRateLimit(
			rateKey,
			requestLimits.resize,
			requestLimitWindowMs,
		)
		if (!gate.ok) {
			return jsonError('Too many requests. Please try again later.', 429)
		}

		if (isUploadTooLarge(request.headers)) {
			return jsonError('Upload a PNG, JPEG, or WebP image under 10MB.', 413)
		}

		const formData = await request.formData()
		const file = formData.get('file')

		if (!(file instanceof File) || !isSupportedImage(file)) {
			return jsonError('Upload a PNG, JPEG, or WebP image under 10MB.')
		}

		const formatValue = formData.get('format')
		const format: OutputFormat = OUTPUT_FORMATS.includes(
			formatValue as OutputFormat,
		)
			? (formatValue as OutputFormat)
			: 'webp'
		const width = parseOptionalInt(formData.get('width'))
		const height = parseOptionalInt(formData.get('height'))
		const quality = parseQuality(formData.get('quality'))
		const preserveAspectRatio =
			formData.get('preserveAspectRatio') !== 'false'

		const input = Buffer.from(await file.arrayBuffer())
		const unsafeImageResponse = await validateImageBufferForProcessing(input)
		if (unsafeImageResponse) return unsafeImageResponse

		const { owner, cookieToSet } = await ensureRequestOwner()

		const inputKey = buildStorageKey({
			kind: 'uploads',
			type: 'convert',
			extension: file.name.split('.').pop() ?? 'bin',
		})
		await saveStorageFile({
			key: inputKey,
			buffer: input,
			contentType: file.type,
		})

		const job = await createProcessingJob({
			type: 'convert',
			inputKey,
			userId: owner.userId,
			anonymousOwnerId: owner.anonymousOwnerId,
			payload: {
				fileName: file.name,
				format,
				width,
				height,
				quality,
				preserveAspectRatio,
			},
		})

		let response: NextResponse
		if (await enqueueProcessingJob(job.id)) {
			response = NextResponse.json(
				{ jobId: job.id, job: serializeProcessingJob(job) },
				{ status: 202 },
			)
		} else {
			const completed = await processJobById(job.id)
			response = NextResponse.json({
				jobId: completed.id,
				resultUrl: completed.resultUrl,
				job: serializeProcessingJob(completed),
			})
		}

		applyAnonymousOwnerCookie(response, cookieToSet)
		return response
	} catch (error) {
		console.error(
			'Convert route failed',
			error instanceof Error ? error.message : 'unknown error',
		)
		return jsonError('Could not convert image.', 500)
	}
}
