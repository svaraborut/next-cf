import { initTRPC } from '@trpc/server'

// https://trpc.io/docs/client/nextjs/setup
const t = initTRPC.create()
export const router = t.router
export const procedure = t.procedure
