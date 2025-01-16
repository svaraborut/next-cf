// todo : move to hooox

import { useMemo, useState } from 'react'

// todo : this is behaving poorly as state is not cached in dev
export function useSet<T>() {
	const [version, setVersion] = useState(0)
	const update = () => setVersion((v) => v + 1)
	const set = useMemo(() => new Set<T>(), [])
	return {
		has: (v: T) => {
			return set.has(v)
		},
		add: (v: T) => {
			set.add(v)
			update()
		},
		toggle: (v: T) => {
			if (set.has(v)) set.delete(v)
			else set.add(v)
			update()
		},
		delete: (v: T) => {
			set.delete(v)
			update()
		},
		clear: () => {
			set.clear()
			update()
		},
		values: () => {
			return Array.from(set.values())
		},
		size: set.size
	}
}
