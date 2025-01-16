import type { ReactElement } from 'react'
import { Config } from '@/config'
import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2'
import { render } from '@react-email/components'

/**
 * Complete email dispatch solution based on AWS SES. The solution includes
 * @react-email to create nice emails with a pre-made component library see
 * https://react.email/components
 */

// type MailContext = {} todo : add context
type MailBundle = {
	subject: string
	text?: string
	html?: string
	react?: ReactElement
}

// Bundled templating functions that produce
export type MailTemplate<Data = void> =
	| MailBundle
	| ((data: Data) => MailBundle | Promise<MailBundle>)

/**
 * Render the email template. If react component is available it will be used to populate the html
 * content. If plain text fallback is missing it will be derived from the react component.
 */
export async function resolveMailTemplate<Data>(
	template: MailTemplate<Data>,
	data: Data
): Promise<{ subject: string; text?: string; html?: string }> {
	if (!template) throw new Error('Provide a mail template')

	const { text, subject, react, html }: MailBundle =
		typeof template === 'function'
			? await Promise.resolve((template as any)(data))
			: (template as MailBundle)

	return {
		subject,
		text: text ?? (react ? await render(react, { plainText: true }) : undefined),
		html: react ? await render(react) : html
	}
}

/**
 * Emails are dispatched via AWS SES. As of the internal working for Next.js the configuration should be all
 * exported in advance during the system startup.
 */
const ses = new SESv2Client({
	region: Config.email.region,
	credentials: {
		accessKeyId: Config.email.keyId,
		secretAccessKey: Config.email.keySecret
	}
})

export async function sendMail<Data>(
	template: MailTemplate<Data>,
	to: string | string[],
	data: Data
) {
	const mail = await resolveMailTemplate(template, data)

	if (Config.isDev) {
		// Log the email to console
		console.log(
			`✉️ ${to}
${mail.subject}
----
${mail.text ?? mail.html}
----`
		)
	} else {
		// Send AWS email
		await ses.send(
			new SendEmailCommand({
				FromEmailAddress: Config.email.sender,
				Destination: {
					ToAddresses: Array.isArray(to) ? to : [to]
				},
				Content: {
					Simple: {
						Subject: {
							Charset: 'UTF-8',
							Data: mail.subject
						},
						Body: {
							Text: mail.text
								? {
										Charset: 'UTF-8',
										Data: mail.text
									}
								: undefined,
							Html: mail.html
								? {
										Charset: 'UTF-8',
										Data: mail.html
									}
								: undefined
						}
					}
				}
			})
		)
	}
}
