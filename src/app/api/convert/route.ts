import { requestLimits } from '@/config/limits'
import { createAndRunImageJob, gateImageUpload } from '@/lib/image-job-route'
import { jsonError, parseQuality } from '@/lib/image-validation'
import { converterSchema } from '@/lib/tool-schemas'

export async function POST(request: Request) {
	try {
		const gate = await gateImageUpload(request, {
			namespace: 'convert',
			limit: requestLimits.resize,
		})
		if (!gate.ok) return gate.response

		const { formData } = gate
		const settings = converterSchema.safeParse({
			format: formData.get('format') ?? 'webp',
			width: formData.get('width') ?? '',
			height: formData.get('height') ?? '',
			preserveAspectRatio: formData.get('preserveAspectRatio') !== 'false',
		})
		if (!settings.success) {
			return jsonError('Check conversion settings and try again.')
		}

		const { format, preserveAspectRatio } = settings.data
		const width = settings.data.width === '' ? undefined : settings.data.width
		const height =
			settings.data.height === '' ? undefined : settings.data.height

		return await createAndRunImageJob({
			type: 'convert',
			file: gate.file,
			input: gate.input,
			payload: {
				fileName: gate.file.name,
				format,
				width,
				height,
				quality: parseQuality(formData.get('quality')),
				preserveAspectRatio,
			},
		})
	} catch (error) {
		console.error(
			'Convert route failed',
			error instanceof Error ? error.message : 'unknown error',
		)
		return jsonError('Could not convert image.', 500)
	}
}
