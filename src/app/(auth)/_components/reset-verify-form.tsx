'use client'

import { KeyRound } from 'lucide-react'

import type { ResetVerifyFormProps } from '../_types'
import { CodeVerificationForm } from './code-verification-form'

export function ResetVerifyForm({ initialEmail }: ResetVerifyFormProps) {
	return (
		<CodeVerificationForm
			initialEmail={initialEmail}
			i18nNamespace='auth.reset'
			confirmEndpoint='/api/password-reset/verify'
			resendEndpoint='/api/password-reset/send'
			icon={<KeyRound aria-hidden='true' className='h-6 w-6' />}
			requireToken
			onSuccess={({ router, email, token }) => {
				// Remove the code entry page from browser history after issuing a reset token.
				router.replace(
					`/reset-password/new?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token ?? '')}`,
				)
			}}
		/>
	)
}
