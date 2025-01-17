import { D1Database, R2Bucket } from '@cloudflare/workers-types'

declare global {
	interface CloudflareEnv {
		DB: D1Database
		R2: R2Bucket
		TURNSTILE_SECRET_KEY: string
		AWS_REGION: string
		AWS_ACCESS_KEY_ID: string
		AWS_SECRET_ACCESS_KEY: string
		AYD: AnalyticsEngineDataset | undefined
		AED_ACCOUNT_ID: string
		AED_API_TOKEN: string
		AED_DATASET: string
	}
}

declare global {
	namespace NodeJS {
		interface ProcessEnv extends CloudflareEnv {
			NEXT_PUBLIC_ENV: 'development' | undefined
			NEXT_PUBLIC_WATERMARK: string
			NEXT_PUBLIC_URL: string
			NEXT_PUBLIC_TURNSTILE_SITE_KEY: string
		}
	}
}
