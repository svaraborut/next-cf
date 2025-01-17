import { HTMLAttributes } from 'react'
import { cn } from '@/components/utils'

export function LoadingArea({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(className, 'flex items-center justify-center rounded bg-gray-50')}
			{...props}
		>
			<p>Loading...</p>
		</div>
	)
}
