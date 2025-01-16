'use client'
import { trpc } from '@/lib/trpc/client'

export function TrpcAnalytics() {
	const query = trpc.analyticsRouter.read.useQuery()

	return (
		<div className='flex flex-col gap-2'>
			<button
				className='cursor-pointer rounded bg-emerald-200 px-1'
				onClick={() => query.refetch()}
			>
				trpc
			</button>
			{query.data && <pre>{JSON.stringify(query.data, null, 2)}</pre>}
			<span>
				{query.isLoading && 'Sending...'}
				{query.isFetched && 'Done'}
				{query.isError && (query.error?.message ?? 'Failed')}
			</span>
		</div>
	)
}
