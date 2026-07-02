import { requestLimits } from '@/config/limits'
import { createAndRunImageJob, gateImageUpload } from '@/lib/image-job-route'
import { jsonError } from '@/lib/image-validation'

export async function POST(request: Request) {
	try {
		const gate = await gateImageUpload(request, {
			namespace: 'bg-remove',
			limit: requestLimits.backgroundRemoval,
		})
		if (!gate.ok) return gate.response

		return await createAndRunImageJob({
			type: 'bg_remove',
			file: gate.file,
			input: gate.input,
			payload: {
				fileName: gate.file.name,
				contentType: gate.file.type,
			},
		})
	} catch (error) {
		console.error(
			'Background remover route failed',
			error instanceof Error ? error.message : 'unknown error',
		)
		return jsonError('Could not process background removal.', 500)
	}
}
