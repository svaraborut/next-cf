import { PickaxeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TrpcTime } from '@/components/TrpcTime'
import { TrpcEmail } from '@/components/TrpcEmail'
import Link from 'next/link'

export default function Home() {
	return (
		<div className='flex flex-col items-start gap-4 p-8'>
			<div>
				<h1>🔥 CloudFlare</h1>
				<div className='flex items-center gap-1'>
					<PickaxeIcon className='size-3' />
					<pre>{process.env.NEXT_PUBLIC_WATERMARK}</pre>
				</div>
			</div>
			<div className='flex gap-2'>
				<Button asChild>
					<Link href='/tasks'>Tasks</Link>
				</Button>
				<Button asChild>
					<Link href='/markdown'>Markdown</Link>
				</Button>
			</div>
			<TrpcTime />
			<TrpcEmail />
		</div>
	)
}
