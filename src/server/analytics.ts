import { procedure, router } from '@/lib/trpc/server'
import { z } from 'zod'
import { wae, WaeNumber, waeQuery, waeTranspose } from '@/lib/wae'
import { Config } from '@/config'

export function logTasksAction(action: 'read' | 'create' | 'update' | 'delete', count: number = 1) {
	wae?.writeDataPoint({
		blobs: [action],
		doubles: [1],
		indexes: ['tasks']
	})
}

export type AnalyticsRange = '30m' | '1d' | '7d' | '30d' | '60d' | '90d'

const ranges = {
	'30m': { stride: 60, range: 1800 }, // 30 min 30 samples
	'1d': { stride: 3600, range: 86_400 }, // 1 day 24 samples
	'7d': { stride: 21_600, range: 604_800 }, // 7 day 28 samples
	'30d': { stride: 86_400, range: 2_592_000 }, // 30 day 30 samples
	'60d': { stride: 172_800, range: 5_184_000 }, // 60 day 30 samples
	'90d': { stride: 259_200, range: 7_776_000 } // 90 day 30 samples
}

export const ZodAnalyticsRead = z.object({
	range: z
		.enum(Array.from(Object.keys(ranges)) as ['30m', '1d', '7d', '30d', '60d', '90d'])
		.default('1d') // todo : how to auto type
})

// https://developers.cloudflare.com/analytics/analytics-engine/sql-api/
// https://developers.cloudflare.com/analytics/analytics-engine/sql-reference/
const QUERY = `
SELECT
    blob1 AS action,
    intDiv(toUInt32(timestamp), 3600) AS hour,
    SUM(double1) as count,
    SUM(_sample_interval) as samples
FROM ${Config.wae.dataset}
WHERE timestamp > NOW() - INTERVAL '1' DAY
GROUP BY action, hour
`

interface QueryResult {
	t: WaeNumber
	f: 'read' | 'create' | 'update' | 'delete'
	c: WaeNumber
}

export const analyticsRouter = router({
	/**
	 * Paginated list of all tasks
	 */
	read: procedure.input(ZodAnalyticsRead).query(async ({ input }) => {
		const range = ranges[input.range]

		// Query
		// https://developers.cloudflare.com/analytics/analytics-engine/sql-api/
		// https://developers.cloudflare.com/analytics/analytics-engine/sql-reference/
		const res = await waeQuery<QueryResult>(`
		SELECT
		    intDiv(toUInt32(timestamp), ${range.stride}) * ${range.stride} AS t,
		    blob1 AS f,
		    SUM(double1) as c
		FROM ${Config.wae.dataset}
		WHERE toUInt32(timestamp) > toUInt32(NOW()) - ${range.range}
		GROUP BY t, f
		`)

		// Remix
		return {
			matrix: waeTranspose<QueryResult>(
				['read', 'create', 'update', 'delete'],
				range.stride,
				range.range,
				res.data
			),
			took: res.took
		}
	})
})
