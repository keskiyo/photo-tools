'use client'

import { useTranslations } from 'next-intl'

import { ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'


import type { ResetPasswordFormProps } from '../_types'
import { PasswordField } from './password-field'

const resetPasswordSchema = z.object({
	password: z.string().min(8),
	confirmPassword: z.string().min(8),
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm({ email, token }: ResetPasswordFormProps) {
	const t = useTranslations()
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const { register, handleSubmit, control } = useForm<ResetPasswordValues>({
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	})

	// Enable submit once both password fields are long enough.
	const [password = '', confirmPassword = ''] = useWatch({
		control,
		name: ['password', 'confirmPassword'],
	})
	const isReady = password.length >= 8 && confirmPassword.length >= 8

	async function onSubmit(values: ResetPasswordValues) {
		const parsed = resetPasswordSchema.safeParse(values)
		if (!parsed.success || values.password !== values.confirmPassword) {
			toast.error(t('common.checkForm'))
			return
		}

		setIsSubmitting(true)

		try {
			const response = await fetch('/api/password-reset/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					token,
					password: parsed.data.password,
				}),
			})

			if (!response.ok) {
				throw new Error(t('auth.reset.failed'))
			}

			toast.success(t('auth.reset.success'))
			// Remove the completed reset page from browser history.
			router.replace('/login')
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : t('auth.reset.failed'),
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='mx-auto w-full max-w-md rounded-[26px] bg-(--gradient-app) p-[1px] transition hover:shadow-(--shadow-card-hover)'>
			<div className='rounded-[25px] bg-(--color-app-surface) px-8 py-8'>
				<div className='mx-auto mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-(--gradient-app-soft) text-(--color-app-accent)'>
					<ShieldCheck aria-hidden='true' className='h-6 w-6' />
				</div>
				<p className='text-center text-xl font-semibold'>
					{t('auth.reset.newTitle')}
				</p>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className='mt-7 flex flex-col gap-3'
				>
					<PasswordField
						label={t('auth.reset.newPassword')}
						placeholder={t('auth.reset.newPassword')}
						autoComplete='new-password'
						registration={register('password')}
						visible={showPassword}
						onToggle={() => setShowPassword(value => !value)}
						showLabel={t('auth.password.show')}
						hideLabel={t('auth.password.hide')}
					/>
					<PasswordField
						label={t('auth.password.confirm')}
						placeholder={t('auth.password.confirm')}
						autoComplete='new-password'
						registration={register('confirmPassword')}
						visible={showConfirmPassword}
						onToggle={() => setShowConfirmPassword(value => !value)}
						showLabel={t('auth.password.show')}
						hideLabel={t('auth.password.hide')}
					/>
					<button
						type='submit'
						disabled={isSubmitting || !isReady}
						className='focus-ring gradient-button mt-5 min-h-11 cursor-pointer rounded-(--radius-button) px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60'
					>
						{t('auth.reset.accept')}
					</button>
				</form>
			</div>
		</div>
	)
}
