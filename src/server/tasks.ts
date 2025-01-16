import { procedure, router } from '@/lib/trpc/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { tasksTable } from '@/lib/db/schema'
import { asc, desc, eq } from 'drizzle-orm'

export const ZodTasksId = z.object({ id: z.number() })
export const ZodTasksRead = z.object({
	limit: z.number().min(1).max(100).default(10),
	cursor: z.number().default(0),
	direction: z.enum(['forward', 'backward']).default('forward')
})
export const ZodTasksCreate = z.object({ text: z.string().max(100) })
export const ZodTasksUpdate = ZodTasksId.extend({
	done: z.boolean().optional(),
	text: z.string().max(100).optional()
})
export const ZodTasksUpdateBatch = z
	.array(ZodTasksId.extend({ done: z.boolean() }))
	.min(1)
	.max(50)
export const ZodTasksDeleteBatch = z.array(ZodTasksId).min(1).max(50)

export const tasksRouter = router({
	/**
	 * Paginated list of all tasks
	 */
	list: procedure.input(ZodTasksRead).query(async ({ input }) => {
		const items = await db
			.select()
			.from(tasksTable)
			.orderBy(input.direction === 'forward' ? asc(tasksTable.id) : desc(tasksTable.id))
			.limit(input.limit + 1)
			.offset(input.cursor)
		return {
			items: items.slice(0, input.limit),
			nextCursor: items.length >= input.limit ? input.cursor + items.length : undefined
		}
	}),
	/**
	 * Create a new task
	 */
	create: procedure.input(ZodTasksCreate).mutation(async ({ input }) => {
		await db.insert(tasksTable).values(input)
	}),
	/**
	 * Update an existing task
	 */
	update: procedure.input(ZodTasksUpdate).mutation(async ({ input }) => {
		await db
			.update(tasksTable)
			.set({ done: input.done, text: input.text })
			.where(eq(tasksTable.id, input.id))
	}),
	/**
	 * Batch update up to 50 tasks (only done flag can be changed)
	 */
	updateBatch: procedure.input(ZodTasksUpdateBatch).mutation(async ({ input }) => {
		const ops = input.map((r) =>
			db.update(tasksTable).set({ done: r.done }).where(eq(tasksTable.id, r.id))
		)
		await db.batch(ops as any)
	}),
	/**
	 * Delete a single task
	 */
	delete: procedure.input(ZodTasksId).mutation(async ({ input }) => {
		await db.delete(tasksTable).where(eq(tasksTable.id, input.id))
	}),
	/**
	 * Batch delete up to 50 tasks
	 */
	deleteBatch: procedure.input(ZodTasksDeleteBatch).mutation(async ({ input }) => {
		const ops = input.map((r) => db.delete(tasksTable).where(eq(tasksTable.id, r.id)))
		await db.batch(ops as any)
	})
})
