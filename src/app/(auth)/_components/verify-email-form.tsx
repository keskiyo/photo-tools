'use client'

import { MailCheck } from 'lucide-react'
import { toast } from 'react-toastify'

import { useTranslations } from 'next-intl'

import type { VerifyEmailFormProps } from '../_types'
import { CodeVerificationForm } from './code-verification-form'

export function VerifyEmailForm({ initialEmail }: VerifyEmailFormProps) {
	const t = useTranslations()

	return (
		<CodeVerificationForm
			initialEmail={initialEmail}
			i18nNamespace='auth.verify'
			confirmEndpoint='/api/email-verification/confirm'
			resendEndpoint='/api/email-verification/send'
			icon={<MailCheck aria-hidden='true' className='h-6 w-6' />}
			onSuccess={({ router }) => {
				toast.success(t('auth.verify.success'))
				router.push('/profile')
				router.refresh()
			}}
		/>
	)
}
