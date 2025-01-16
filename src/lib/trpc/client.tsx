'use client'
import { createTRPCNext } from '@trpc/next'
import type { AppRouter } from '@/server'
import { httpBatchLink } from '@trpc/client'
import { ReactNode } from 'react'

// todo : convert to a util function
// If you want to use SSR, you need to use the server's full URL
// @see https://trpc.io/docs/v11/ssr
function getBaseUrl() {
	if (typeof window !== 'undefined') {
		// browser should use relative path
		return ''
	}
	if (process.env.NEXT_PUBLIC_URL) {
		// CloudFlare
		return process.env.NEXT_PUBLIC_URL
	} else {
		// localhost
		return `http://localhost:${process.env.PORT ?? 3000}`
	}
}

export const trpc = createTRPCNext<AppRouter>({
	config(opts) {
		return {
			links: [
				httpBatchLink({
					url: `${getBaseUrl()}/trpc`,
					async headers() {
						return {
							// authorization: getAuthCookie(),
						}
					}
				})
			]
		}
	},
	// https://trpc.io/docs/v11/ssr
	ssr: false
})

// a homebrew alternative to the old fashion _app.tsx approach

interface TRPCProviderProps {
	children: ReactNode
}

export default function TRPCProvider({ children }: TRPCProviderProps) {
	const TRPC = trpc.withTRPC(() => children)
	return <TRPC />
}
