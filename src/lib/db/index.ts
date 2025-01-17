import { drizzle } from 'drizzle-orm/d1'
import { schema } from '@/lib/db/schema'
import { getRequestContext } from '@cloudflare/next-on-pages'

// https://github.com/cjxe/nextjs-d1-drizzle-cloudflare-pages/blob/main/src/server/db/index.ts
function initDbConnection() {
	if (process.env.NODE_ENV === 'development') {
		return drizzle(getRequestContext().env.DB, { schema })
	} else {
		return drizzle(process.env.DB, { schema })
	}
}

export const db = initDbConnection()
