import { HTMLAttributes } from 'react'
import { Roboto, Roboto_Mono } from 'next/font/google'
import './styles/globals.scss'

const geistSans = Roboto({
	variable: '--font-geist-sans',
	subsets: ['latin'],
	weight: '400'
})

const geistMono = Roboto_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
})

export function Body({ className, ...props }: HTMLAttributes<HTMLBodyElement>) {
	return <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} {...props} />
}
