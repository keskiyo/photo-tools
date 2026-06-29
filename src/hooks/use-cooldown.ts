'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Countdown cooldown. Starts immediately at `seconds` and ticks to 0.
 * Call `start()` to restart it (e.g. after re-sending a code).
 */
export function useCooldown(seconds: number) {
	const [remaining, setRemaining] = useState(seconds)

	useEffect(() => {
		if (remaining <= 0) return
		const timer = setTimeout(() => setRemaining(value => value - 1), 1000)
		return () => clearTimeout(timer)
	}, [remaining])

	const start = useCallback(() => setRemaining(seconds), [seconds])

	return { remaining, isCoolingDown: remaining > 0, start }
}
