/**
 * Verify a CloudFlare Turnstile token
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function verifyTurnstile(token: string | undefined): Promise<boolean> {
	if (!token) return false
	try {
		const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				secret: process.env.TURNSTILE_SECRET_KEY,
				response: token
			})
		})
		return !!(await response.json<any>())?.success
	} catch (e) {
		return false
	}
}
