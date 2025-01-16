'use client'
import { trpc } from '@/lib/trpc/client'

export function TrpcGeo() {
	const query = trpc.geo.useQuery()

	return (
		<div className='flex gap-2'>
			<button
				className='cursor-pointer rounded bg-emerald-200 px-1'
				onClick={() => query.refetch()}
			>
				geo
			</button>
			{query.data && <pre>{JSON.stringify(query.data, null, 2)}</pre>}
		</div>
	)
}
