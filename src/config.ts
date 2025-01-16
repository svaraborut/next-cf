// CloudFlare is edge, NODE_ENV is not present, therefore we use a custom flag
const isDev = process.env.NEXT_PUBLIC_ENV === 'development'

// Determine the base url from env or assume we are in localhost
const baseUrl = process.env.NEXT_PUBLIC_URL || `http://localhost:${process.env.PORT ?? 3000}`

// todo : use https://github.com/t3-oss/t3-env
export const Config = {
	// Env
	isDev,

	// Url
	baseUrl,
	resolveUrl(path: string): string {
		return new URL(path, baseUrl).href
	},

	// Email
	email: {
		sender: 'Axelered <test@axelered.com>',
		region: process.env.AWS_REGION!,
		keyId: process.env.AWS_ACCESS_KEY_ID!,
		keySecret: process.env.AWS_SECRET_ACCESS_KEY!
	},

	// Worker Analytics Engine
	wae: {
		accountId: process.env.AED_ACCOUNT_ID!,
		apiToken: process.env.AED_API_TOKEN!,
		dataset: process.env.AED_DATASET!
	}
}
