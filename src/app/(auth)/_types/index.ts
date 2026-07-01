import type { ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

export type AuthMode = 'login' | 'register'

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
