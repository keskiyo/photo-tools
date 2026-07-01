'use client'

import type { Dimension, UseConverterDimensionsOptions } from '../_types'
import { computePairedDimension } from '../_utils/dimensions'

/** Width/height handlers for the converter form, with aspect-ratio sync. */
export function useConverterDimensions({
	sourceSize,
	setValue,
	getValues,
}: UseConverterDimensionsOptions) {
	function updateDimension(field: Dimension, value: string) {
		const numericValue = Number.parseInt(value, 10)
		const nextValue = Number.isFinite(numericValue)
			? Math.max(1, numericValue)
			: ''

		setValue(field, nextValue, { shouldDirty: true, shouldValidate: true })

		if (!sourceSize || !getValues('preserveAspectRatio') || !nextValue) {
			return
		}

		const pairedField: Dimension = field === 'width' ? 'height' : 'width'
		setValue(
			pairedField,
			computePairedDimension(field, Number(nextValue), sourceSize),
			{ shouldDirty: true, shouldValidate: true },
		)
	}

	function stepDimension(field: Dimension, direction: 1 | -1) {
		const value = getValues(field)
		const numericValue =
			typeof value === 'number' ? value : Number.parseInt(String(value), 10)
		const baseValue = Number.isFinite(numericValue) ? numericValue : 0
		updateDimension(field, String(Math.max(1, baseValue + direction)))
	}

	return { updateDimension, stepDimension }
}
