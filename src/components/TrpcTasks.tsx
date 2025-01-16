'use client'
import { trpc } from '@/lib/trpc/client'
import {
	CheckIcon,
	ChevronDownIcon,
	PencilIcon,
	PlusIcon,
	RefreshCcwIcon,
	SquareCheckIcon,
	Trash2Icon
} from 'lucide-react'
import { cn } from '@/components/utils'
import { useState } from 'react'
import { useAsync } from '@reactit/hooks'
import { useDeviceTouch } from '@/components/hooks/useDeviceTouch'
import { useSet } from '@/components/hooks/useSet'
import { Button } from '@/components/ui/button'

export function TrpcTasks() {
	const touch = useDeviceTouch()
	const [text, setText] = useState('')
	const selectionSet = useSet<number>()

	const util = trpc.useUtils()
	const query = trpc.tasks.list.useInfiniteQuery(
		{ limit: 10 },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor, initialCursor: 1 }
	)
	// todo : all this invalidate() is messy
	const addMutation = trpc.tasks.create.useMutation({
		onSuccess: () => util.tasks.invalidate()
	})
	const updateMutation = trpc.tasks.update.useMutation({
		onSuccess: () => util.tasks.invalidate()
	})
	const updateBatchMutation = trpc.tasks.updateBatch.useMutation({
		onSuccess: () => util.tasks.invalidate()
	})
	const deleteMutation = trpc.tasks.delete.useMutation({
		onSuccess: () => util.tasks.invalidate()
	})
	const deleteBatchMutation = trpc.tasks.deleteBatch.useMutation({
		onSuccess: () => util.tasks.invalidate()
	})
	const addTask = useAsync(async () => {
		await addMutation.mutateAsync({ text })
		setText('')
	})

	return (
		<div className='flex flex-col rounded-lg border'>
			<div className='flex items-center gap-2 border-b p-2'>
				<span className='flex-1 pl-8 text-lg font-bold'>My Tasks</span>
				{selectionSet.size > 0 && (
					<>
						<span className='mx-4'>{selectionSet.size} tasks selected</span>
						<Button
							variant='secondary'
							onClick={() => {
								updateBatchMutation.mutate(
									selectionSet.values().map((id) => ({ id, done: true }))
								)
								selectionSet.clear()
							}}
						>
							<SquareCheckIcon />
							Check
						</Button>
						<Button
							variant='secondary'
							onClick={() => {
								updateBatchMutation.mutate(
									selectionSet.values().map((id) => ({ id, done: false }))
								)
								selectionSet.clear()
							}}
						>
							<SquareCheckIcon />
							Uncheck
						</Button>
						<Button
							variant='secondary'
							onClick={() => {
								deleteBatchMutation.mutate(
									selectionSet.values().map((id) => ({ id }))
								)
								selectionSet.clear()
							}}
						>
							<Trash2Icon />
							Delete All
						</Button>
					</>
				)}
				<Button variant='secondary' onClick={() => query.refetch()}>
					<RefreshCcwIcon />
					Refresh
				</Button>
			</div>
			<div className='flex flex-col gap-1 p-1'>
				{query.data?.pages
					?.flatMap((p) => p.items)
					?.map((el) => (
						<div
							key={el.id}
							className={cn(
								'group flex cursor-pointer items-center gap-2 rounded p-1',
								selectionSet.has(el.id) && 'bg-blue-50'
							)}
							onClick={() => selectionSet.toggle(el.id)}
						>
							<button
								className={cn(
									'-mr-1 cursor-pointer rounded p-1 hover:bg-gray-200',
									el.done ? 'text-emerald-600' : 'text-gray-300'
								)}
								onClick={(e) => {
									e.stopPropagation()
									updateMutation.mutate({ id: el.id, done: !el.done })
								}}
							>
								<CheckIcon className='size-5' />
							</button>
							<span className='flex-1'>{el.text}</span>
							<div
								className={cn(
									'-my-1 -space-x-1',
									touch ? '' : 'invisible group-hover:visible'
								)}
							>
								<Button variant='ghost' size='sm'>
									<PencilIcon />
								</Button>
								<Button
									variant='ghost'
									size='sm'
									onClick={(e) => {
										e.stopPropagation()
										deleteMutation.mutate({ id: el.id })
									}}
								>
									<Trash2Icon />
								</Button>
							</div>
						</div>
					))}
			</div>
			{query.hasNextPage && (
				<div className='flex justify-center'>
					<Button variant='link' onClick={() => query.fetchNextPage()}>
						<ChevronDownIcon />
						Load More
					</Button>
				</div>
			)}
			<div className='flex items-center gap-2 border-t p-2'>
				<input
					className='min-w-0 flex-1 bg-transparent py-1.5 pl-8'
					placeholder='New task'
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyPress={(e) => e.key === 'Enter' && addTask.run()}
				/>
				<Button size='sm' onClick={addTask.run}>
					<PlusIcon />
					Add
				</Button>
			</div>
		</div>
	)
}
