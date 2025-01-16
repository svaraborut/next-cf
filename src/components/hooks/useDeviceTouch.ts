// todo : move to hooox

import { useEffect, useRef, useState } from 'react'

// export function useLazy<T>(fn: () => T): { value: () => T; clear: () => void } {
// 	const ref = useRef<T | undefined>()
// 	return {
// 		value: () => {
// 			if (ref.current === undefined) ref.current = fn()
// 			return ref.current
// 		},
// 		clear: () => {
// 			ref.current = undefined
// 		}
// 	}
// }

// export function useLazy<T>(fn: () => T): () => T {
// 	const ref = useRef<T | undefined>()
// 	return useCallback(() => {
// 		if (ref.current === undefined) ref.current = fn()
// 		return ref.current
// 	}, [])
// }

export function useMedia(query: string): boolean {
	// Hack to make it ssr compliant
	if (global.window === undefined) return false
	// Lazy MQ creation
	const ref = useRef<MediaQueryList | undefined>()
	// This state hack prevents any flicker on the first render cycle
	const [state, setState] = useState<boolean>(() => {
		if (query) ref.current = window.matchMedia(query)
		return !!ref.current?.matches
	})
	// Handle query string change, and listen to media query updates
	useEffect(() => {
		ref.current = query ? window.matchMedia(query) : undefined
		if (!ref.current) return
		setState(ref.current.matches)
		function onChange(e: MediaQueryListEvent) {
			setState(e.matches)
		}
		ref.current.addEventListener('change', onChange)
		return () => {
			ref.current?.removeEventListener('change', onChange)
			ref.current = undefined
		}
	}, [query])
	// Return result
	return state
}

export function useDeviceTouch() {
	return useMedia('(pointer: coarse)')
}
