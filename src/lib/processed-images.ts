import { prisma } from '@/lib/prisma'
import type {
	ProcessedImageRecord,
	ProcessedImageType,
} from '@/types/processed-image'

type DbProcessedImage = {
	id: string
	type: string
	prompt: string | null
	fileName: string | null
	resultUrl: string
	userId: string | null
	anonymousOwnerId: string | null
	createdAt: Date
}

type CreateProcessedImageInput = {
	type: ProcessedImageType
	prompt?: string
	fileName?: string
	resultUrl: string
	userId?: string | null
	anonymousOwnerId?: string | null
}

type ProcessedImageOwner = {
	userId?: string | null
	anonymousOwnerId?: string | null
}

export async function createProcessedImage(
	input: CreateProcessedImageInput,
): Promise<ProcessedImageRecord | null> {
	try {
		const record = await prisma.processedImage.create({
			data: {
				type: input.type,
				prompt: input.prompt,
				fileName: input.fileName,
				resultUrl: input.resultUrl,
				userId: input.userId ?? null,
				anonymousOwnerId: input.userId
					? null
					: (input.anonymousOwnerId ?? null),
			},
		})
		return mapProcessedImage(record)
	} catch (error) {
		if (!isMissingProcessedImageTable(error)) {
			console.error('Failed to save processed image', error)
		}
		return null
	}
}

export async function getRecentProcessedImages(
	type: ProcessedImageType,
	take = 10,
	owner: ProcessedImageOwner = {},
): Promise<ProcessedImageRecord[]> {
	try {
		const records = await prisma.processedImage.findMany({
			where: {
				type,
				...getOwnerWhere(owner),
			},
			orderBy: { createdAt: 'desc' },
			take,
		})
		return records.map(mapProcessedImage)
	} catch (error) {
		if (!isMissingProcessedImageTable(error)) {
			console.error('Failed to load processed images', error)
		}
		return []
	}
}

export async function claimAnonymousProcessedImages({
	anonymousOwnerId,
	userId,
}: {
	anonymousOwnerId: string
	userId: string
}) {
	await prisma.processedImage.updateMany({
		where: {
			anonymousOwnerId,
			userId: null,
		},
		data: {
			anonymousOwnerId: null,
			userId,
		},
	})
}

function getOwnerWhere(owner: ProcessedImageOwner) {
	if (owner.userId) {
		return { userId: owner.userId }
	}

	if (owner.anonymousOwnerId) {
		return {
			userId: null,
			anonymousOwnerId: owner.anonymousOwnerId,
		}
	}

	return {
		userId: null,
		anonymousOwnerId: null,
	}
}

function mapProcessedImage(record: DbProcessedImage): ProcessedImageRecord {
	return {
		...record,
		type: record.type as ProcessedImageType,
	}
}

function isMissingProcessedImageTable(error: unknown) {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		(error.code === 'P2021' || error.code === 'P2022')
	)
}
