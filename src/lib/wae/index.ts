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
	const start = Date.now()
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
		return {
			...(await response.json()),
			took: Date.now() - start
		}
	}
}

// (!) CF is inconsistent with the number return type
export type WaeNumber = number | string

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
	took: number
}

export type WaeTransposeInput = { t: WaeNumber; f: string; c: WaeNumber }
export type WaeTransposeResult<T extends WaeTransposeInput> = { [K in T['c']]: WaeNumber } & {
	t: WaeNumber
}

/**
 * Transpose a WAE result to a time-series. The query result should include some required keys:
 *  - t the timestamp floored to stride
 *  - f the flag of separate time series
 *  - c the counter
 */
export function waeTranspose<T extends WaeTransposeInput>(
	flags: T['c'][],
	stride: number,
	range: number,
	data: T[]
): WaeTransposeResult<T>[] {
	// (!) this may not be perfectly aligned with CloudFlare servers but for our purposes and given
	// the fact that time is registered to stride multiples it will be ok.
	const now = Date.now() / 1000
	// This should be the timestamp of the first sample. THE +stride offsets the aggregation by 1 stride
	// making sure to include the latest data BUT LOSES THE FIRST SAMPLE
	const start = now - range - ((now - range) % stride) + stride
	// Ordered timestamp axis, all timestamps are stride aligned with EPOCH, the last should precede now
	const timeAxis = Array.from({ length: Math.ceil(range / stride) }, (_, i) => start + i * stride)
	// Prepare a DENSE LUT for remapping and set sparse values to the MATRIX
	const lutEntity = Object.fromEntries(flags.map((f) => [f, 0]))
	const lut = Object.fromEntries(timeAxis.map((t) => ['' + t, { t, ...lutEntity }]))
	const flagsLut = Object.fromEntries(flags.map((f) => [f, 1]))
	data.filter((d) => !!(lut as any)['' + d.t] && !!flagsLut[d.f]).forEach(
		(d) => ((lut as any)['' + d.t][d.f] = d.c)
	)
	// Convert LUT to array
	return timeAxis.map((t) => lut[t]) as any
}
