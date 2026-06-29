'use client'

import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form'

import type { ConverterFormValues } from '@/lib/tool-schemas'

type SourceSize = { width: number; height: number } | null
type Dimension = 'width' | 'height'

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

/** Width/height handlers for the converter form, with aspect-ratio sync. */
export function useConverterDimensions({
	sourceSize,
	setValue,
	getValues,
}: {
	sourceSize: SourceSize
	setValue: UseFormSetValue<ConverterFormValues>
	getValues: UseFormGetValues<ConverterFormValues>
}) {
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
