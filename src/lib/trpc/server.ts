import { initTRPC } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { NextRequest } from 'next/server'

export type TrpcContext = {
	ip: NextRequest['ip']
	geo: NextRequest['geo']
}

// todo : properly type
export const createContext = async (opts: FetchCreateContextFnOptions) => {
	// fetchRequestHandler is typed with Request but we know we use NextRequest
	const req = opts.req as NextRequest
	return {
		ip: req.ip,
		geo: req.geo
	} satisfies TrpcContext
}

// https://trpc.io/docs/client/nextjs/setup
const t = initTRPC.context<TrpcContext>().create()
export const router = t.router
export const procedure = t.procedure
