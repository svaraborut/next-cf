import { procedure, router } from '@/lib/trpc/server'
import { z } from 'zod'
import { wae, waeQuery } from '@/lib/wae'
import { Config } from '@/config'

export function logTasksAction(action: 'read' | 'create' | 'update' | 'delete', count: number = 1) {
	wae?.writeDataPoint({
		blobs: [action],
		doubles: [1],
		indexes: ['tasks']
	})
}

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
	action: string
	hour: number
	count: number
	samples: number
}

export const ZodTasksId = z.object({ id: z.number() })

export const analyticsRouter = router({
	/**
	 * Paginated list of all tasks
	 */
	read: procedure.query(async () => {
		const start = Date.now()
		const res = await waeQuery<QueryResult>(QUERY)
		return {
			...res,
			took: Date.now() - start
		}
	})
})
