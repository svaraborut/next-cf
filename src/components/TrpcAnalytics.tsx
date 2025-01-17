'use client'
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, XAxis } from 'recharts'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { useCallback, useMemo, useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { AnalyticsRange } from '@/server/analytics'
import { RefreshCcwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WaeNumber } from '@/lib/wae'
import { LoadingArea } from '@/components/LoadingArea'

const series = [
	{ key: 'read', label: 'Reads' },
	{ key: 'create', label: 'Created' },
	{ key: 'update', label: 'Updates' },
	{ key: 'delete', label: 'Deleted' }
]

const dateFormats: { [K in AnalyticsRange]: { time?: true } & Intl.DateTimeFormatOptions } = {
	'30m': {
		time: true,
		hour: '2-digit',
		minute: '2-digit'
	},
	'1d': {
		time: true,
		hour: '2-digit',
		minute: '2-digit'
	},
	'7d': {
		month: 'short',
		day: 'numeric'
	},
	'30d': {
		month: 'short',
		day: 'numeric'
	},
	'60d': {
		month: 'short',
		day: 'numeric'
	},
	'90d': {
		month: 'short',
		day: 'numeric'
	}
}

export function TrpcAnalytics() {
	const [timeRange, setTimeRange] = useState<AnalyticsRange>('1d')
	const query = trpc.analyticsRouter.read.useQuery({ range: timeRange })

	// Prepare color configs
	const chartConfig = useMemo<ChartConfig>(() => {
		return Object.fromEntries(
			series.map((se, i) => [
				se.key,
				{ label: se.label, color: `hsl(var(--chart-${i + 1}))` }
			])
		)
	}, [])

	// Label converter
	const labelConverter = useCallback(
		(value: WaeNumber) => {
			// todo : wrong timezone
			const date = new Date(parseInt(value as any) * 1000)
			const fmt = dateFormats[timeRange]
			// todo : use proper intl or use i18n
			return date.toLocaleString(navigator.language, fmt)
		},
		[timeRange]
	)

	return (
		<Card className='shadow-none'>
			<CardHeader className='flex items-center gap-2 space-y-0 border-b p-2 sm:flex-row'>
				<div className='grid flex-1 gap-1 text-center sm:text-left'>
					<CardTitle className='pl-8 text-lg'>Tasks Activity</CardTitle>
				</div>
				{query.data && <span className='text-sm'>Computed in {query.data.took} ms</span>}
				<Select value={timeRange} onValueChange={setTimeRange as any}>
					<SelectTrigger
						className='w-[160px] rounded-lg sm:ml-auto'
						aria-label='Select a value'
					>
						<SelectValue placeholder='Last 3 months' />
					</SelectTrigger>
					<SelectContent className='rounded-xl'>
						<SelectItem value='30m' className='rounded-lg'>
							Last 30 minutes
						</SelectItem>
						<SelectItem value='1d' className='rounded-lg'>
							Last 24 hours
						</SelectItem>
						<SelectItem value='7d' className='rounded-lg'>
							Last 7 days
						</SelectItem>
						<SelectItem value='30d' className='rounded-lg'>
							Last 30 days
						</SelectItem>
						<SelectItem value='60d' className='rounded-lg'>
							Last 60 days
						</SelectItem>
						<SelectItem value='90d' className='rounded-lg'>
							Last 90 days
						</SelectItem>
					</SelectContent>
				</Select>
				<Button variant='secondary' onClick={() => query.refetch()}>
					<RefreshCcwIcon />
					Refresh
				</Button>
			</CardHeader>
			<CardContent className='p-2'>
				{!query.isSuccess || !query.data ? (
					<LoadingArea className='h-[200px] w-full' />
				) : (
					<ChartContainer config={chartConfig} className='aspect-auto h-[200px] w-full'>
						<AreaChart data={query.data.matrix}>
							<defs>
								{series.map((se) => (
									<linearGradient
										key={se.key}
										id={`fill-${se.key}`}
										x1='0'
										y1='0'
										x2='0'
										y2='1'
									>
										<stop
											offset='5%'
											stopColor={`var(--color-${se.key})`}
											stopOpacity={0.8}
										/>
										<stop
											offset='90%'
											stopColor={`var(--color-${se.key})`}
											stopOpacity={0}
										/>
									</linearGradient>
								))}
							</defs>
							{/*<CartesianGrid vertical={true} horizontal={false} />*/}
							<XAxis
								dataKey='t'
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								minTickGap={32}
								tickFormatter={labelConverter}
							/>
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										labelFormatter={labelConverter}
										indicator='dot'
									/>
								}
							/>
							{series.map((se) => (
								<Area
									key={se.key}
									dataKey={se.key}
									type='linear'
									fill={`url(#fill-${se.key})`}
									stroke={`var(--color-${se.key})`}
									stackId={se.key}
								/>
							))}
						</AreaChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	)
}
