'use client'

import { useTranslations } from 'next-intl'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { useCooldown } from '@/hooks/use-cooldown'

import type { CodeVerificationFormProps } from '../_types'

const RESEND_COOLDOWN_SECONDS = 100

const codeSchema = z.object({
	email: z.string().trim().pipe(z.email()),
	code: z
		.string()
		.trim()
		.refine(value => /^\d{6}$/.test(value)),
})

type CodeValues = z.infer<typeof codeSchema>

/**
 * Shared email + 6-digit-code form used by both the email-verification and
 * password-reset flows. The flows differ only in copy (i18n namespace),
 * endpoints, icon, and what happens on success.
 */
export function CodeVerificationForm({
	initialEmail,
	i18nNamespace,
	confirmEndpoint,
	resendEndpoint,
	icon,
	requireToken = false,
	onSuccess,
}: CodeVerificationFormProps) {
	const t = useTranslations()
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSending, setIsSending] = useState(false)
	const { remaining, isCoolingDown, start } = useCooldown(
		RESEND_COOLDOWN_SECONDS,
	)
	const { register, handleSubmit, getValues } = useForm<CodeValues>({
		defaultValues: {
			email: initialEmail,
			code: '',
		},
	})

	function message(key: 'invalid' | 'expired' | 'locked' | 'failed' | 'sent') {
		return t(`${i18nNamespace}.${key}`)
	}

	function errorMessage(reason: string | undefined) {
		if (reason === 'expired') return message('expired')
		if (reason === 'locked') return message('locked')
		return message('invalid')
	}

	async function onSubmit(values: CodeValues) {
		const parsed = codeSchema.safeParse(values)
		if (!parsed.success) {
			toast.error(message('invalid'))
			return
		}

		setIsSubmitting(true)

		try {
			const response = await fetch(confirmEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(parsed.data),
			})
			const data = (await response.json().catch(() => null)) as {
				token?: string
				error?: string
			} | null

			if (!response.ok || (requireToken && !data?.token)) {
				throw new Error(errorMessage(data?.error))
			}

			onSuccess({
				router,
				email: parsed.data.email,
				token: data?.token,
			})
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : message('failed'),
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	async function resendCode() {
		const email = getValues('email').trim()
		if (!z.email().safeParse(email).success) {
			toast.error(t('auth.invalidEmail'))
			return
		}

		setIsSending(true)

		try {
			const response = await fetch(resendEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			})

			if (!response.ok) {
				throw new Error(message('failed'))
			}

			toast.success(message('sent'))
			start()
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : message('failed'),
			)
		} finally {
			setIsSending(false)
		}
	}

	return (
		<div className='auth-card'>
			<div className='auth-card-inner px-8 py-8'>
				<div className='mx-auto mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-(--gradient-app-soft) text-(--color-app-accent)'>
					{icon}
				</div>
				<p className='text-center text-xl font-semibold'>
					{t(`${i18nNamespace}.title`)}
				</p>
				<p className='mt-3 text-center text-sm leading-6 text-(--color-app-text-secondary)'>
					{t(`${i18nNamespace}.description`)}
				</p>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className='mt-7 flex flex-col gap-4'
				>
					<label className='grid gap-2 text-sm font-semibold'>
						{t('auth.email')}
						<input
							{...register('email')}
							type='email'
							autoComplete='email'
							className='focus-ring min-h-12 rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-bg-soft) px-4 text-sm outline-none'
						/>
					</label>
					<label className='grid gap-2 text-sm font-semibold'>
						{t(`${i18nNamespace}.code.label`)}
						<input
							{...register('code')}
							type='text'
							inputMode='numeric'
							autoComplete='one-time-code'
							maxLength={6}
							placeholder={t(`${i18nNamespace}.code.placeholder`)}
							className='focus-ring min-h-12 rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-bg-soft) px-4 text-center text-lg font-semibold tracking-[0.3em] outline-none placeholder:text-(--color-app-text-muted)'
						/>
					</label>
					<button
						type='submit'
						disabled={isSubmitting}
						className='focus-ring gradient-button mt-3 min-h-11 cursor-pointer rounded-(--radius-button) px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60'
					>
						{t(`${i18nNamespace}.submit`)}
					</button>
					<button
						type='button'
						disabled={isSending || isCoolingDown}
						onClick={resendCode}
						className='focus-ring min-h-11 cursor-pointer rounded-(--radius-button) border border-(--color-app-border) bg-(--color-app-surface-light) px-5 text-sm font-semibold transition hover:border-(--color-app-border-strong) disabled:cursor-not-allowed disabled:opacity-60'
					>
						{isCoolingDown
							? `${t(`${i18nNamespace}.resend`)} (${remaining})`
							: t(`${i18nNamespace}.resend`)}
					</button>
				</form>
			</div>
		</div>
	)
}
