import { procedure, router } from '@/lib/trpc/server'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { sendMail } from '@/lib/mails'
import { TemplateOtp } from '@/mails/TemplateOtp'
import { Config } from '@/config'
import { tasksRouter } from '@/server/tasks'
import { analyticsRouter } from '@/server/analytics'

export const appRouter = router({
	time: procedure.query(async () => {
		return {
			data: new Date()
		}
	}),
	geo: procedure.query(async ({ ctx }) => {
		return {
			geo: ctx.geo,
			ip: ctx.ip
		}
	}),
	tasks: tasksRouter,
	email: procedure
		.input(z.object({ to: z.string().email(), code: z.string() }))
		.mutation(async ({ input }) => {
			// todo : add turnstyle
			if (input.code !== 'AYjIERHbjWgjAIuo') {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			} else {
				await sendMail(TemplateOtp, input.to, {
					otp: (Math.random() + '').slice(-8),
					url: Config.resolveUrl('/markdown')
				})
			}
		}),
	analyticsRouter
})

// export type definition of API
export type AppRouter = typeof appRouter
