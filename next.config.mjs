import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'
import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'

// https://www.reddit.com/r/nextjs/comments/1et99o0/working_with_md_not_mdx_files/
const withMDX = createMDX({
	extension: /\.(md|mdx)$/,
	options: {
		remarkPlugins: [remarkGfm],
		rehypePlugins: []
	}
})

/** @type {import('next').NextConfig} */
const nextConfig = {
	pageExtensions: ['md', 'mdx', 'ts', 'tsx']
}

export default withMDX(nextConfig)

// Initialize development env for wrangler with next.js
if (process.env.NODE_ENV === 'development') {
	setupDevPlatform({ persist: true }).catch((e) => console.error(e))
}
