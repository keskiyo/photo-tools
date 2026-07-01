import { Worker } from 'bullmq'
import { loadEnvConfig } from '@next/env'

import { processJobById } from '@/lib/process-job'
import {
	QUEUE_NAME,
	getBullConnectionOptions,
} from '@/lib/processing-queue'

loadEnvConfig(process.cwd())

const redisUrl = process.env.REDIS_URL

if (!redisUrl) {
	throw new Error('REDIS_URL is required to start the image worker.')
}

const worker = new Worker(
	QUEUE_NAME,
	async job => {
		const id = job.data?.id
		if (typeof id !== 'string') {
			throw new Error('Worker job is missing processing job id.')
		}
		await processJobById(id)
	},
	{
		connection: getBullConnectionOptions(),
		concurrency: Number.parseInt(
			process.env.IMAGE_WORKER_CONCURRENCY ?? '3',
			10,
		),
	},
)

worker.on('failed', (job, error) => {
	console.error('Image worker job failed', {
		id: job?.id,
		error,
	})
})

worker.on('completed', job => {
	console.log('Image worker job completed', { id: job.id })
})
