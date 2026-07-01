import { describe, expect, it } from 'vitest'

import {
	isTerminalJobStatus,
	serializeProcessingJob,
	type ProcessingJobRecord,
} from '@/lib/processing-jobs'

describe('processing job helpers', () => {
	it('serializes job records into the API response shape', () => {
		const createdAt = new Date('2026-06-30T01:02:03.000Z')
		const updatedAt = new Date('2026-06-30T01:03:03.000Z')
		const job: ProcessingJobRecord = {
			id: 'job_1',
			type: 'convert',
			status: 'completed',
			progress: 100,
			inputKey: 'uploads/convert/input.webp',
			resultUrl: '/generated/convert/result.webp',
			error: null,
			userId: null,
			anonymousOwnerId: null,
			payload: null,
			createdAt,
			updatedAt,
		}

		expect(serializeProcessingJob(job)).toEqual({
			id: 'job_1',
			type: 'convert',
			status: 'completed',
			progress: 100,
			resultUrl: '/generated/convert/result.webp',
			error: null,
			createdAt: createdAt.toISOString(),
			updatedAt: updatedAt.toISOString(),
		})
	})

	it('knows which statuses are terminal', () => {
		expect(isTerminalJobStatus('queued')).toBe(false)
		expect(isTerminalJobStatus('processing')).toBe(false)
		expect(isTerminalJobStatus('completed')).toBe(true)
		expect(isTerminalJobStatus('failed')).toBe(true)
		expect(isTerminalJobStatus('cancelled')).toBe(true)
	})
})
