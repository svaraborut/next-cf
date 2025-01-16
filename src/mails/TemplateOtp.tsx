import { Email } from '@/mails/Email'
import type { MailTemplate } from '@/lib/mails'
import { Button } from '@react-email/button'
import { Text } from '@react-email/text'
import { Heading } from '@react-email/heading'

export const TemplateOtp: MailTemplate<{ otp: string; url: string }> = (data) => ({
	subject: 'Verify your email',
	react: (
		<Email previewText='Use this link to confirm your email address'>
			<Text className='text-2xl font-bold'>Your authentication code</Text>
			<Text>
				Enter it in your open browser window to confirm your account. This code will expire
				in 15 minutes.
			</Text>
			<Heading className='block rounded-xl bg-gray-100 py-2 text-center font-mono tracking-widest'>
				{data.otp}
			</Heading>
			<Button
				className='my-8 block cursor-pointer rounded bg-blue-500 px-4 py-3 text-center text-white'
				href={data.url}
			>
				Confirm Email
			</Button>
			<Text>
				This link will only be valid for the next 10 minutes. If the link has already
				expired attempt to login and the a new verification email will be sent to you.
			</Text>
		</Email>
	)
})
