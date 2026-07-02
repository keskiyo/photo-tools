import type { ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import type { useRouter } from 'next/navigation'

export type AuthMode = 'login' | 'register'

export type CodeVerificationSuccess = {
	router: ReturnType<typeof useRouter>
	email: string
	token?: string
}

export type CodeVerificationFormProps = {
	initialEmail: string
	/** i18n prefix that holds title/description/submit/resend/invalid/expired/locked/failed/sent/code.* */
	i18nNamespace: 'auth.verify' | 'auth.reset'
	confirmEndpoint: string
	resendEndpoint: string
	icon: ReactNode
	/** When true, a 200 without `token` in the body is treated as a failure. */
	requireToken?: boolean
	onSuccess: (context: CodeVerificationSuccess) => void
}

export type AuthFormProps = {
	mode: AuthMode
}

export type AuthFieldProps = {
	icon: ReactNode
	label: string
	children: ReactNode
	error?: string
	errorId?: string
}

export type PasswordFieldProps = {
	label: string
	placeholder: string
	autoComplete: string
	registration: UseFormRegisterReturn
	visible: boolean
	onToggle: () => void
	showLabel: string
	hideLabel: string
	error?: string
	errorId?: string
}

export type VerifyEmailFormProps = {
	initialEmail: string
}

export type ResetVerifyFormProps = {
	initialEmail: string
}

export type ResetPasswordFormProps = {
	email: string
	token: string
}
