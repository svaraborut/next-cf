import type { Metadata } from 'next'
import { Body } from '@/components/Body'
import { ReactNode } from 'react'
import TRPCProvider from '@/lib/trpc/client'

export const metadata: Metadata = {
	title: 'CloudFlare',
	description: 'Next.js on CloudFlare playground'
}

export default function RootLayout({
	children
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<html lang='en'>
			<TRPCProvider>
				<Body>{children}</Body>
			</TRPCProvider>
		</html>
	)
}
