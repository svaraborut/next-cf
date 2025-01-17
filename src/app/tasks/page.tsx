import { TrpcTasks } from '@/components/TrpcTasks'
import { TrpcAnalytics } from '@/components/TrpcAnalytics'

export default function Tasks() {
	return (
		<div className='flex flex-col gap-4 p-8'>
			<TrpcAnalytics />
			<TrpcTasks />
		</div>
	)
}
