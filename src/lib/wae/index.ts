import { getRequestContext } from '@cloudflare/next-on-pages'
import { Config } from '@/config'

function initAedConnection(): AnalyticsEngineDataset | undefined {
	const aed =
		process.env.NODE_ENV === 'development' ? getRequestContext().env.AYD : process.env.AYD
	// It seems that in local development mode this utility is not working
	return typeof aed?.writeDataPoint === 'function' ? aed : undefined
}

export const wae = initAedConnection()

export async function waeQuery<T extends Object>(sql: string): Promise<WaeQueryResult<T>> {
	// Make sure the developer is not switching away from the default JSON format
	if (sql.match(/(^|\s)FORMAT($|\s)/gi)) {
		throw new Error(
			'The query cannot include FORMAT statements. Only default JSON is supported'
		)
	}
	// Query
	const API = `https://api.cloudflare.com/client/v4/accounts/${Config.wae.accountId}/analytics_engine/sql`
	const response = await fetch(API, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${Config.wae.apiToken}`
		},
		body: sql
	})
	if (response.status !== 200) {
		throw new Error('Failed to read analytics')
	} else {
		return await response.json()
	}
}

// todo : improve typing
// https://developers.cloudflare.com/analytics/analytics-engine/sql-reference/#format-clause
export interface WaeQueryResult<T extends Object> {
	meta: {
		name: string
		type: 'String' | 'UInt32' | 'Float64' | 'DateTime'
	}[]
	data: T[]
	rows: number
	rows_before_limit_at_least: number
}
