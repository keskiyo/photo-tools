import { NextResponse } from 'next/server'

import { readRequestOwner } from '@/lib/anonymous-owner'
import { getProcessingJob, serializeProcessingJob } from '@/lib/processing-jobs'

type RouteContext = {
	params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
	const { id } = await context.params
	const job = await getProcessingJob(id)

	if (!job) {
		return NextResponse.json(
			{ error: 'Processing job not found.' },
			{ status: 404 },
		)
	}

	// Only the job's owner may read its status. Return 404 (not 403) on mismatch
	// so the endpoint never confirms the existence of another owner's job.
	const owner = await readRequestOwner()
	const isOwner =
		(job.userId !== null && job.userId === owner.userId) ||
		(job.anonymousOwnerId !== null &&
			job.anonymousOwnerId === owner.anonymousOwnerId)

	if (!isOwner) {
		return NextResponse.json(
			{ error: 'Processing job not found.' },
			{ status: 404 },
		)
	}

	return NextResponse.json(serializeProcessingJob(job))
}
