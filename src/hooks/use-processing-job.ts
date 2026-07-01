import { isAbortError } from '@/hooks/use-abortable-submit'

export type ProcessingJobResponse = {
	id: string
	type: string
	status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
	progress: number
	resultUrl: string | null
	error: string | null
}

export type JobCapableResponse = {
	resultUrl?: string
	jobId?: string
	error?: string
}

export async function resolveJobResult(
	data: JobCapableResponse,
	options: {
		fallbackError: string
		signal?: AbortSignal
		onProgress?: (progress: number) => void
	},
) {
	if (data.resultUrl) return data.resultUrl
	if (!data.jobId) {
		throw new Error(data.error ?? options.fallbackError)
	}

	while (true) {
		await sleep(1_200, options.signal)
		const response = await fetch(`/api/jobs/${data.jobId}`, {
			signal: options.signal,
		})
		const job = (await response.json()) as
			| ProcessingJobResponse
			| { error?: string }

		if (!response.ok || !('status' in job)) {
			throw new Error(job.error ?? options.fallbackError)
		}

		options.onProgress?.(job.progress)

		if (job.status === 'completed' && job.resultUrl) {
			return job.resultUrl
		}

		if (job.status === 'failed' || job.status === 'cancelled') {
			throw new Error(job.error ?? options.fallbackError)
		}
	}
}

function sleep(ms: number, signal?: AbortSignal) {
	return new Promise<void>((resolve, reject) => {
		if (signal?.aborted) {
			reject(new DOMException('Aborted', 'AbortError'))
			return
		}

		const timeout = window.setTimeout(resolve, ms)
		signal?.addEventListener(
			'abort',
			() => {
				window.clearTimeout(timeout)
				reject(new DOMException('Aborted', 'AbortError'))
			},
			{ once: true },
		)
	}).catch(error => {
		if (isAbortError(error)) throw error
		throw error
	})
}
