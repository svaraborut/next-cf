import { getRequestContext } from '@cloudflare/next-on-pages'

function initR2() {
	return process.env.NODE_ENV === 'development' ? getRequestContext().env.R2 : process.env.R2
}

export const r2 = initR2()
