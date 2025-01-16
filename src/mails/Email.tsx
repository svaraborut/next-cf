import type { ReactNode } from 'react'
import { Config } from '@/config'
import { Body } from '@react-email/body'
import { Container, Hr, Img } from '@react-email/components'
import { Head } from '@react-email/head'
import { Html } from '@react-email/html'
import { Preview } from '@react-email/preview'
import { Section } from '@react-email/section'
import { Tailwind } from '@react-email/tailwind'
import { Text } from '@react-email/text'

// Various email clients do not support SVGs https://www.caniemail.com/features/image-svg/
const logoUrl = Config.resolveUrl('/assets/logo.png')

export interface EmailProps {
	previewText?: string
	lang?: string
	children: ReactNode
}

// Emails can be previewed in the browser, but shall be made sure there is no
// tailwind default css included as it alters the behaviour of tables
export function Email({ previewText, lang = 'en', children }: EmailProps) {
	return (
		<Html lang={lang}>
			<Head />
			{previewText && <Preview>{previewText}</Preview>}
			<Tailwind>
				<Body
					className='mx-auto my-auto bg-white p-4'
					style={{
						fontFamily:
							'ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji'
					}}
				>
					<Container className='max-w-[465px] rounded-xl border border-solid border-[#eaeaea] bg-white p-4'>
						<Container>
							<Section className='py-4'>
								<Img className='h-8' src={logoUrl} height='45px' alt='App Logo' />
							</Section>
							<Section className='py-4'>{children}</Section>
							<Hr />
							<Section className='pt-4 text-[12px] leading-5'>
								<Text className='text-xs'>
									App will never email you and ask you to disclose or verify your
									password, credit card, or banking account number.
								</Text>
								<Text className='text-xs'>
									© 2022 App Technologies, LLC, a Salesforce company. 500 Howard
									Street, San Francisco, CA 94105, USA. All rights reserved.
								</Text>
							</Section>
						</Container>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
