import { PickaxeIcon } from 'lucide-react'

export default function Home() {
	return (
		<div className='p-8'>
			<h1>🔥 CLoudFlare</h1>
			<div className='flex items-center gap-1'>
				<PickaxeIcon className='size-3' />
				<pre>{process.env.NEXT_PUBLIC_WATERMARK}</pre>
			</div>
		</div>
	)
}
