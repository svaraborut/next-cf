import { initTRPC } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { IncomingRequestCfProperties } from '@cloudflare/workers-types'

export type TrpcContext = {
	ip: NextRequest['ip']
	geo: NextRequest['geo']
	cf: IncomingRequestCfProperties<any>
}

// todo : properly type
export const createContext = async (opts: FetchCreateContextFnOptions) => {
	// Get CloudFlare cf context
	const { cf } = getRequestContext()
	// fetchRequestHandler is typed with Request but we know we use NextRequest
	const req = opts.req as NextRequest
	return {
		ip: req.ip,
		geo: req.geo,
		cf
	} satisfies TrpcContext
}

// https://trpc.io/docs/client/nextjs/setup
const t = initTRPC.context<TrpcContext>().create()
export const router = t.router
export const procedure = t.procedure
