import type { ReactNode } from 'react'
import type {
	UseFormGetValues,
	UseFormRegisterReturn,
	UseFormSetValue,
} from 'react-hook-form'

import type { JobCapableResponse } from '@/hooks/use-processing-job'
import type { ConverterFormValues } from '@/lib/tool-schemas'

export type Dimension = 'width' | 'height'
export type SourceSize = { width: number; height: number } | null

export type ConverterApiResponse = JobCapableResponse

export type NumberStepperProps = {
	label: ReactNode
	inputProps: UseFormRegisterReturn
	placeholder: string
	increaseLabel: string
	decreaseLabel: string
	onValueChange: (value: string) => void
	onIncrement: () => void
	onDecrement: () => void
}

export type UseConverterDimensionsOptions = {
	sourceSize: SourceSize
	setValue: UseFormSetValue<ConverterFormValues>
	getValues: UseFormGetValues<ConverterFormValues>
}
