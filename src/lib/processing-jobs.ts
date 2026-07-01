import { prisma } from '@/lib/prisma'
import type { ProcessedImageType } from '@/types/processed-image'

export const PROCESSING_JOB_STATUSES = [
	'queued',
	'processing',
	'completed',
	'failed',
	'cancelled',
] as const

export type ProcessingJobStatus = (typeof PROCESSING_JOB_STATUSES)[number]

export type ProcessingJobRecord = {
	id: string
	type: ProcessedImageType
	status: ProcessingJobStatus
	progress: number
	inputKey: string | null
	resultUrl: string | null
	error: string | null
	userId: string | null
	anonymousOwnerId: string | null
	payload: unknown
	createdAt: Date
	updatedAt: Date
}

export type CreateProcessingJobInput = {
	type: ProcessedImageType
	inputKey?: string | null
	payload?: unknown
	userId?: string | null
	anonymousOwnerId?: string | null
}

export function isTerminalJobStatus(status: ProcessingJobStatus) {
	return (
		status === 'completed' ||
		status === 'failed' ||
		status === 'cancelled'
	)
}

export function serializeProcessingJob(job: ProcessingJobRecord) {
	return {
		id: job.id,
		type: job.type,
		status: job.status,
		progress: job.progress,
		resultUrl: job.resultUrl,
		error: job.error,
		createdAt: job.createdAt.toISOString(),
		updatedAt: job.updatedAt.toISOString(),
	}
}

export async function createProcessingJob(input: CreateProcessingJobInput) {
	const job = await prisma.processingJob.create({
		data: {
			type: input.type,
			status: 'queued',
			progress: 0,
			inputKey: input.inputKey ?? null,
			payload: input.payload ?? undefined,
			userId: input.userId ?? null,
			anonymousOwnerId: input.userId
				? null
				: (input.anonymousOwnerId ?? null),
		},
	})
	return mapProcessingJob(job)
}

export async function getProcessingJob(id: string) {
	const job = await prisma.processingJob.findUnique({ where: { id } })
	return job ? mapProcessingJob(job) : null
}

export async function markProcessingJobStarted(id: string) {
	const job = await prisma.processingJob.update({
		where: { id },
		data: {
			status: 'processing',
			progress: 10,
		},
	})
	return mapProcessingJob(job)
}

export async function markProcessingJobCompleted({
	id,
	resultUrl,
}: {
	id: string
	resultUrl: string
}) {
	const job = await prisma.processingJob.update({
		where: { id },
		data: {
			status: 'completed',
			progress: 100,
			resultUrl,
			error: null,
		},
	})
	return mapProcessingJob(job)
}

export async function markProcessingJobFailed({
	id,
	error,
}: {
	id: string
	error: string
}) {
	const job = await prisma.processingJob.update({
		where: { id },
		data: {
			status: 'failed',
			error,
		},
	})
	return mapProcessingJob(job)
}

function mapProcessingJob(record: {
	id: string
	type: string
	status: string
	progress: number
	inputKey: string | null
	resultUrl: string | null
	error: string | null
	userId: string | null
	anonymousOwnerId: string | null
	payload: unknown
	createdAt: Date
	updatedAt: Date
}): ProcessingJobRecord {
	return {
		...record,
		type: record.type as ProcessedImageType,
		status: record.status as ProcessingJobStatus,
	}
}
