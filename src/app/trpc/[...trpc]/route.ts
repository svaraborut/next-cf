import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server'
import { createContext } from '@/lib/trpc/server'

export const runtime = 'edge'

// https://trpc.io/docs/client/nextjs/setup
async function handler(req: Request) {
	return fetchRequestHandler({
		endpoint: '/trpc',
		req,
		router: appRouter,
		createContext
	})
}

// Export a named method for each HTTP method
export { handler as GET, handler as POST }
