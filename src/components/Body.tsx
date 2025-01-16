import { HTMLAttributes } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.scss'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
})

export function Body({ className, ...props }: HTMLAttributes<HTMLBodyElement>) {
	return <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} {...props} />
}
