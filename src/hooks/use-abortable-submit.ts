'use client'

import { useEffect, useRef } from 'react'

/**
 * Provides a per-submit AbortController whose request is cancelled if the
 * component unmounts mid-flight (e.g. the user navigates away). Submit buttons
 * are already disabled while in flight, so this focuses on the unmount case and
 * lets callers ignore the resulting abort error.
 */
export function useAbortableSubmit() {
	const controllerRef = useRef<AbortController | null>(null)

	useEffect(() => {
		return () => controllerRef.current?.abort()
	}, [])

	return {
		begin(): AbortSignal {
			controllerRef.current = new AbortController()
			return controllerRef.current.signal
		},
	}
}

/** True when an error is an AbortController cancellation, not a real failure. */
export function isAbortError(error: unknown): boolean {
	return error instanceof DOMException && error.name === 'AbortError'
}
