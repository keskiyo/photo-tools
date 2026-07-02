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
import { requestLimitWindowMs } from '@/config/limits'
import type { ProcessedImageType } from '@/types/processed-image'

const UPLOAD_ERROR = 'Upload a PNG, JPEG, or WebP image under 10MB.'

type GateResult =
	| { ok: true; file: File; input: Buffer; formData: FormData }
	| { ok: false; response: Response }

/**
 * Shared gate for image-upload tool routes (convert, bg-remove): rate limit,
 * early size rejection, file type/size validation, and image-buffer safety.
 * Returns the parsed file + buffer, or a ready error response.
 */
export async function gateImageUpload(
	request: Request,
	{ namespace, limit }: { namespace: string; limit: number },
): Promise<GateResult> {
	const rateKey = resolveRateKey(namespace, request.headers)
	const gate = await consumeDistributedRateLimit(
		rateKey,
		limit,
		requestLimitWindowMs,
	)
	if (!gate.ok) {
		return {
			ok: false,
			response: jsonError('Too many requests. Please try again later.', 429),
		}
	}

	if (isUploadTooLarge(request.headers)) {
		return { ok: false, response: jsonError(UPLOAD_ERROR, 413) }
	}

	const formData = await request.formData()
	const file = formData.get('file')

	if (!(file instanceof File) || !isSupportedImage(file)) {
		return { ok: false, response: jsonError(UPLOAD_ERROR) }
	}

	const input = Buffer.from(await file.arrayBuffer())
	const unsafeImageResponse = await validateImageBufferForProcessing(input)
	if (unsafeImageResponse) {
		return { ok: false, response: unsafeImageResponse }
	}

	return { ok: true, file, input, formData }
}

/**
 * Stores the upload, creates the ProcessingJob for the current owner, then
 * queues it (202) or runs it inline. Also persists the anonymous-owner cookie.
 */
export async function createAndRunImageJob({
	type,
	file,
	input,
	payload,
}: {
	type: ProcessedImageType
	file: File
	input: Buffer
	payload: Record<string, unknown>
}): Promise<NextResponse> {
	const { owner, cookieToSet } = await ensureRequestOwner()

	const inputKey = buildStorageKey({
		kind: 'uploads',
		type,
		extension: file.name.split('.').pop() ?? 'bin',
	})
	await saveStorageFile({
		key: inputKey,
		buffer: input,
		contentType: file.type,
	})

	const job = await createProcessingJob({
		type,
		inputKey,
		userId: owner.userId,
		anonymousOwnerId: owner.anonymousOwnerId,
		payload,
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
}
