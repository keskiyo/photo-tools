export const requestLimits = {
	/** Successful AI image generations. */
	aiGeneration: 9999,
	/** Successful background removals. */
	backgroundRemoval: 9999,
	/** Successful image resizes/conversions (effectively unlimited). */
	resize: 9999,
} as const

/** Rolling window the counts above are measured over. */
export const requestLimitWindowMs = 24 * 60 * 60 * 1000
