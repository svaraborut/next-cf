import { PickaxeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
	return (
		<div className='flex flex-col items-start gap-4 p-8'>
			<div>
				<h1>🔥 CLoudFlare</h1>
				<div className='flex items-center gap-1'>
					<PickaxeIcon className='size-3' />
					<pre>{process.env.NEXT_PUBLIC_WATERMARK}</pre>
				</div>
			</div>
			<Button>Click Me</Button>
		</div>
	)
}
