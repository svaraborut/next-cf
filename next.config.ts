import type { NextConfig } from 'next'
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

const nextConfig: NextConfig = {
	pageExtensions: ['md', 'mdx', 'ts', 'tsx']
}

export default withMDX(nextConfig)
