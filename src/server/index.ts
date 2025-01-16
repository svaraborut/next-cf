import { procedure, router } from '@/lib/trpc/server'

export const appRouter = router({
	time: procedure.query(async () => {
		return {
			data: new Date()
		}
	})
})

// export type definition of API
export type AppRouter = typeof appRouter
