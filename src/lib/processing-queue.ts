import { Queue, type ConnectionOptions } from 'bullmq'

const QUEUE_NAME = 'image-processing'

let queue: Queue | null = null

export function isProcessingQueueConfigured() {
	return Boolean(process.env.REDIS_URL)
}

export function getProcessingQueue() {
	if (!isProcessingQueueConfigured()) return null
	queue ??= new Queue(QUEUE_NAME, {
		connection: getBullConnectionOptions(),
	})
	return queue
}

export async function enqueueProcessingJob(id: string) {
	const processingQueue = getProcessingQueue()
	if (!processingQueue) return false

	await processingQueue.add(
		'process-image',
		{ id },
		{
			jobId: id,
			attempts: 3,
			backoff: {
				type: 'exponential',
				delay: 2_000,
			},
			removeOnComplete: 1000,
			removeOnFail: 5000,
		},
	)
	return true
}

export { QUEUE_NAME }

export function getBullConnectionOptions(): ConnectionOptions {
	const redisUrl = new URL(process.env.REDIS_URL!)
	return {
		host: redisUrl.hostname,
		port: redisUrl.port ? Number.parseInt(redisUrl.port, 10) : 6379,
		username: redisUrl.username || undefined,
		password: redisUrl.password || undefined,
		db: redisUrl.pathname
			? Number.parseInt(redisUrl.pathname.replace('/', ''), 10) || 0
			: 0,
		tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
		maxRetriesPerRequest: null,
	}
}
