'use client'

import { useTranslations } from 'next-intl'

import { MailCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { useCooldown } from '@/hooks/use-cooldown'

import type { VerifyEmailFormProps } from '../_types'

const RESEND_COOLDOWN_SECONDS = 100

const verifyEmailSchema = z.object({
	email: z.string().trim().pipe(z.email()),
	code: z
		.string()
		.trim()
		.refine(value => /^\d{6}$/.test(value)),
})

type VerifyEmailValues = z.infer<typeof verifyEmailSchema>

export function VerifyEmailForm({ initialEmail }: VerifyEmailFormProps) {
	const t = useTranslations()
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSending, setIsSending] = useState(false)
	const { remaining, isCoolingDown, start } = useCooldown(
		RESEND_COOLDOWN_SECONDS,
	)
	const { register, handleSubmit, getValues } = useForm<VerifyEmailValues>({
		defaultValues: {
			email: initialEmail,
			code: '',
		},
	})

	async function onSubmit(values: VerifyEmailValues) {
		const parsed = verifyEmailSchema.safeParse(values)
		if (!parsed.success) {
			toast.error(t('auth.verify.invalid'))
			return
		}

		setIsSubmitting(true)

		try {
			const response = await fetch('/api/email-verification/confirm', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(parsed.data),
			})
			const data = (await response.json().catch(() => null)) as {
				error?: string
			} | null

			if (!response.ok) {
				throw new Error(getVerificationErrorMessage(data?.error, t))
			}

			toast.success(t('auth.verify.success'))
			router.push('/profile')
			router.refresh()
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t('auth.verify.failed'),
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	async function resendCode() {
		const email = getValues('email').trim()
		if (!email) {
			toast.error(t('auth.invalidEmail'))
			return
		}

		setIsSending(true)

		try {
			const response = await fetch('/api/email-verification/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			})

			if (!response.ok) {
				throw new Error(t('auth.verify.failed'))
			}

			toast.success(t('auth.verify.sent'))
			start()
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t('auth.verify.failed'),
			)
		} finally {
			setIsSending(false)
		}
	}

	return (
		<div className='mx-auto w-full max-w-md rounded-[26px] bg-(--gradient-app) p-px transition hover:shadow-(--shadow-card-hover)'>
			<div className='rounded-[25px] bg-(--color-app-surface) px-8 py-8'>
				<div className='mx-auto mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-(--gradient-app-soft) text-(--color-app-accent)'>
					<MailCheck aria-hidden='true' className='h-6 w-6' />
				</div>
				<p className='text-center text-xl font-semibold'>
					{t('auth.verify.title')}
				</p>
				<p className='mt-3 text-center text-sm leading-6 text-(--color-app-text-secondary)'>
					{t('auth.verify.description')}
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
						{t('auth.verify.code.label')}
						<input
							{...register('code')}
							type='text'
							inputMode='numeric'
							autoComplete='one-time-code'
							maxLength={6}
							placeholder={t('auth.verify.code.placeholder')}
							className='focus-ring min-h-12 rounded-(--radius-control) border border-(--color-app-border) bg-(--color-app-bg-soft) px-4 text-center text-lg font-semibold tracking-[0.3em] outline-none placeholder:text-(--color-app-text-muted)'
						/>
					</label>
					<button
						type='submit'
						disabled={isSubmitting}
						className='focus-ring gradient-button mt-3 min-h-11 cursor-pointer rounded-(--radius-button) px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60'
					>
						{t('auth.verify.submit')}
					</button>
					<button
						type='button'
						disabled={isSending || isCoolingDown}
						onClick={resendCode}
						className='focus-ring min-h-11 cursor-pointer rounded-(--radius-button) border border-(--color-app-border) bg-(--color-app-surface-light) px-5 text-sm font-semibold transition hover:border-(--color-app-border-strong) disabled:cursor-not-allowed disabled:opacity-60'
					>
						{isCoolingDown
							? `${t('auth.verify.resend')} (${remaining})`
							: t('auth.verify.resend')}
					</button>
				</form>
			</div>
		</div>
	)
}

function getVerificationErrorMessage(
	reason: string | undefined,
	t: ReturnType<typeof useTranslations>,
) {
	if (reason === 'expired') return t('auth.verify.expired')
	if (reason === 'locked') return t('auth.verify.locked')
	return t('auth.verify.invalid')
}
