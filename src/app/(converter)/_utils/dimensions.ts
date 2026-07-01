import type { Dimension } from '../_types'

/**
 * Pure: computes the paired dimension that keeps the source aspect ratio.
 * `field` is the dimension the user edited; returns the other one.
 */
export function computePairedDimension(
	field: Dimension,
	value: number,
	sourceSize: { width: number; height: number },
): number {
	const ratio =
		field === 'width'
			? sourceSize.height / sourceSize.width
			: sourceSize.width / sourceSize.height
	return Math.max(1, Math.round(value * ratio))
}
