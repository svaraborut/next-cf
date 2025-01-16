import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	schema: './src/lib/db/schema.ts',
	out: './migrations',
	driver: 'd1-http',
	dialect: 'sqlite'
})
