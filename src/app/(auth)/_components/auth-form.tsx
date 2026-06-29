'use client'

import { Mail, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { authClient } from '@/lib/auth-client'
import { useLocalization } from '@/localization'

import { useForgotPassword } from '../_hooks/use-forgot-password'
import { AuthField } from './auth-field'
import { PasswordField } from './password-field'

const authSchema = z.object({
	name: z.string().trim().min(2).optional(),
	email: z.string().trim().pipe(z.email()),
	password: z.string().min(8),
})

type AuthFormValues = z.infer<typeof authSchema> & {
	confirmPassword?: string
}

type AuthFormProps = {
	mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
	const { t } = useLocalization()
	const router = useRouter()
	const { isSendingReset, requestReset } = useForgotPassword()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const isRegister = mode === 'register'
	const { register, handleSubmit, control } = useForm<AuthFormValues>({
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	})

	// Keep registration disabled until the required fields are filled.
	const [name = '', email = '', password = '', confirmPassword = ''] =
		useWatch({
			control,
			name: ['name', 'email', 'password', 'confirmPassword'],
		})

	// Password equality is checked on submit so the toast can explain the issue.
	const isRegisterReady =
		name.trim().length >= 2 &&
		email.trim().length > 0 &&
		password.length >= 8 &&
		confirmPassword.length >= 8

	const isSubmitDisabled = isSubmitting || (isRegister && !isRegisterReady)

	async function onSubmit(values: AuthFormValues) {
		const parsed = authSchema.safeParse(values)
		if (!parsed.success) {
			toast.error(t('common.checkForm'))
			return
		}

		// Keep password mismatch errors generic.
		if (isRegister && values.password !== values.confirmPassword) {
			toast.error(t('common.checkForm'))
			return
		}

		setIsSubmitting(true)

		try {
			if (isRegister) {
				const { error } = await authClient.signUp.email({
					name: parsed.data.name ?? parsed.data.email,
					email: parsed.data.email,
					password: parsed.data.password,
				})

				if (error) {
					throw new Error(
						error.message ?? t('auth.registrationFailed'),
					)
				}

				await claimAnonymousImages()
				await sendVerificationCode(
					parsed.data.email,
					t('auth.verify.failed'),
				)
				toast.success(t('auth.verify.sent'))
				router.push(
					`/verify-email?email=${encodeURIComponent(parsed.data.email)}`,
				)
				router.refresh()
				return
			} else {
				const { error } = await authClient.signIn.email({
					email: parsed.data.email,
					password: parsed.data.password,
					rememberMe: true,
				})

				if (error) {
					throw new Error(error.message ?? t('auth.loginFailed'))
				}

				toast.success(t('auth.loggedIn'))
			}

			await claimAnonymousImages()
			router.push('/profile')
			router.refresh()
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t('auth.requestFailed'),
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='mx-auto w-full max-w-md rounded-[26px] bg-(--gradient-app) p-px transition hover:shadow-(--shadow-card-hover)'>
			<div className='rounded-[25px] bg-(--color-app-surface) transition duration-200 hover:scale-[0.99]'>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className='flex flex-col gap-3 px-8 py-8'
				>
					<p className='mb-6 text-center text-xl font-semibold'>
						{isRegister
							? t('auth.register.title')
							: t('auth.login.title')}
					</p>

					{isRegister ? (
						<AuthField
							icon={<UserRound aria-hidden='true' />}
							label={t('auth.name')}
						>
							<input
								{...register('name')}
								type='text'
								placeholder={t('auth.name.placeholder')}
								autoComplete='name'
								className='w-full bg-transparent text-sm text-(--color-app-text) outline-none placeholder:text-(--color-app-text-muted)'
							/>
						</AuthField>
					) : null}

					<AuthField
						icon={<Mail aria-hidden='true' />}
						label={t('auth.email')}
					>
						<input
							{...register('email')}
							type='email'
							placeholder={t('auth.email')}
							autoComplete='email'
							className='w-full bg-transparent text-sm text-(--color-app-text) outline-none placeholder:text-(--color-app-text-muted)'
						/>
					</AuthField>

					<PasswordField
						label={t('auth.password')}
						placeholder={t('auth.password')}
						autoComplete={
							isRegister ? 'new-password' : 'current-password'
						}
						registration={register('password')}
						visible={showPassword}
						onToggle={() => setShowPassword(value => !value)}
						showLabel={t('auth.password.show')}
						hideLabel={t('auth.password.hide')}
					/>

					{isRegister ? (
						<PasswordField
							label={t('auth.password.confirm')}
							placeholder={t('auth.password.confirm')}
							autoComplete='new-password'
							registration={register('confirmPassword')}
							visible={showConfirmPassword}
							onToggle={() =>
								setShowConfirmPassword(value => !value)
							}
							showLabel={t('auth.password.show')}
							hideLabel={t('auth.password.hide')}
						/>
					) : null}

					{!isRegister ? (
						<button
							type='button'
							onClick={() => requestReset(email)}
							disabled={isSendingReset}
							className='focus-ring self-end rounded text-sm font-medium text-(--color-app-text-secondary) underline-offset-4 transition hover:text-(--color-app-text) hover:underline disabled:opacity-60'
						>
							{t('auth.forgotPassword')}
						</button>
					) : null}

					<div className='mt-8 flex flex-col gap-3 sm:flex-row'>
						<button
							type='submit'
							disabled={isSubmitDisabled}
							className='focus-ring gradient-button min-h-11 flex-1 cursor-pointer rounded-(--radius-button) px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60'
						>
							{isRegister ? t('auth.signUp') : t('auth.login')}
						</button>
						<Link
							href={isRegister ? '/login' : '/register'}
							className='focus-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-(--radius-button) border border-(--color-app-border) bg-(--color-app-surface-light) px-5 text-sm font-semibold transition hover:border-(--color-app-border-strong)'
						>
							{isRegister ? t('auth.login') : t('auth.signUp')}
						</Link>
					</div>
				</form>
			</div>
		</div>
	)
}

async function claimAnonymousImages() {
	await fetch('/api/processed-images/claim', {
		method: 'POST',
	})
}

async function sendVerificationCode(email: string, errorMessage: string) {
	const response = await fetch('/api/email-verification/send', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email }),
	})

	if (!response.ok) {
		throw new Error(errorMessage)
	}
}
