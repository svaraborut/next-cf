'use client'
import { trpc } from '@/lib/trpc/client'

export function TrpcTime() {
	const query = trpc.time.useQuery()

	return (
		<div className='flex gap-2'>
			<button
				className='cursor-pointer rounded bg-emerald-200 px-1'
				onClick={() => query.refetch()}
			>
				trpc
			</button>
			<span className='font-mono'>{query.data?.data}</span>
		</div>
	)
}
