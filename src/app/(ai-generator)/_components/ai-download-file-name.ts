import type { GeneratorValues } from '../_types'

export function createAiDownloadFileName({
	aspectRatio,
	style,
}: Pick<GeneratorValues, 'aspectRatio' | 'style'>) {
	const stylePart = style === 'none' ? 'ai_image' : `${style}_style`
	const ratioPart = aspectRatio.replace(':', 'x')

	return `${stylePart}_${ratioPart}.jpg`
}
