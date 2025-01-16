import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const tasksTable = sqliteTable('tasks', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	text: text('text'),
	done: integer('done', { mode: 'boolean' }).default(false).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
})

export const schema = {
	tasksTable
}
