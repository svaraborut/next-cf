'use client'
import { trpc } from '@/lib/trpc/client'
import { useState } from 'react'
import { useAsync } from '@reactit/hooks'

export function TrpcEmail() {
	const sendEmail = trpc.email.useMutation()
	const [to, setTo] = useState('')
	const [code, setCode] = useState('')

	const task = useAsync(async () => {
		await sendEmail.mutateAsync({ to, code })
	})

	return (
		<div className='flex gap-2'>
			<button
				className='cursor-pointer rounded bg-emerald-200 px-1'
				disabled={task.isLoading}
				onClick={() => task.run()}
			>
				Send
			</button>
			<input placeholder='to' value={to} onChange={(e) => setTo(e.target.value)} />
			<input placeholder='code' value={code} onChange={(e) => setCode(e.target.value)} />
			<span>
				{task.isLoading && 'Sending...'}
				{task.isSucceed && 'Done'}
				{task.isFailed && (task.error?.message ?? 'Failed')}
			</span>
		</div>
	)
}
