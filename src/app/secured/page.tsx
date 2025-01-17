'use client'
import { Turnstile } from '@marsidev/react-turnstile'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCheckIcon } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/components/utils'

export default function Page() {
	const [token, setToken] = useState<string>()

	const checkMutation = trpc.turnstileCheck.useMutation()

	return (
		<div className='flex flex-col items-start gap-4 p-8'>
			<h1>🔒 CloudFlare Turnstile</h1>
			{token && (
				<pre
					className={cn(
						'rounded bg-gray-50 px-4 py-1',
						checkMutation.isError && 'bg-amber-700',
						checkMutation.isSuccess && 'bg-emerald-400'
					)}
				>
					{token}
				</pre>
			)}
			<Button
				variant='secondary'
				size='sm'
				disabled={!token}
				onClick={() => token && checkMutation.mutate({ token })}
			>
				<CheckCheckIcon />
				Verify Token
			</Button>
			<Turnstile
				siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
				onSuccess={(token) => setToken(token)}
				onExpire={() => setToken(undefined)}
				onError={(e) => setToken(undefined)}
			/>
		</div>
	)
}
