'use client'

import { useTranslations } from 'next-intl'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { ProfileFormField } from './profile-form-field'
import { validatePasswordChange } from './profile-settings-validation'
import type { ProfileSettingsValues, ProfileUser } from '../_types/profile'

const profileSchema = z.object({
	name: z.string().trim().min(2),
	email: z.string().trim().pipe(z.email()),
})

type ProfileSettingsFormProps = {
	onUserUpdate: (user: ProfileUser) => void
	user: ProfileUser
}

type ProfileResponse = {
	email?: string
	emailVerificationRequired?: boolean
	error?: string
	name?: string
}

export function ProfileSettingsForm({
	onUserUpdate,
	user,
}: ProfileSettingsFormProps) {
	const t = useTranslations()
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const {
		formState: { errors },
		handleSubmit,
		register,
		reset,
	} = useForm<ProfileSettingsValues>({
		defaultValues: {
			confirmPassword: '',
			currentPassword: '',
			email: user.email,
			name: user.name,
			newPassword: '',
		},
	})

	async function onSubmit(values: ProfileSettingsValues) {
		const parsedProfile = profileSchema.safeParse({
			email: values.email,
			name: values.name,
		})

		if (!parsedProfile.success) {
			toast.error(t('common.checkForm'))
			return
		}

		const nextUser = {
			email: parsedProfile.data.email.toLowerCase(),
			name: parsedProfile.data.name,
		}
		const shouldUpdateProfile =
			nextUser.name !== user.name || nextUser.email !== user.email.toLowerCase()
		const wantsPasswordChange = Boolean(
			values.currentPassword || values.newPassword || values.confirmPassword,
		)

		if (!validatePasswordChange(values, wantsPasswordChange, t)) {
			return
		}

		setIsSubmitting(true)

		try {
			if (wantsPasswordChange) {
				await changePassword(values)
			}

			let profileResponse: ProfileResponse | null = null
			if (shouldUpdateProfile) {
				profileResponse = await updateProfile(nextUser)
				onUserUpdate({
					email: profileResponse.email ?? nextUser.email,
					name: profileResponse.name ?? nextUser.name,
				})
			}

			reset({
				confirmPassword: '',
				currentPassword: '',
				email: profileResponse?.email ?? nextUser.email,
				name: profileResponse?.name ?? nextUser.name,
				newPassword: '',
			})

			if (profileResponse?.emailVerificationRequired) {
				toast.success(t('auth.profile.emailChanged'))
				router.push(
					`/verify-email?email=${encodeURIComponent(
						profileResponse.email ?? nextUser.email,
					)}`,
				)
				router.refresh()
				return
			}

			if (wantsPasswordChange) {
				toast.success(t('auth.profile.passwordChanged'))
			} else {
				toast.success(t('auth.profile.saved'))
			}

			router.refresh()
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t('auth.profile.profileUpdateFailed'),
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	async function updateProfile(
		userData: ProfileUser,
	): Promise<ProfileResponse> {
		const response = await fetch('/api/profile', {
			body: JSON.stringify(userData),
			headers: { 'Content-Type': 'application/json' },
			method: 'PATCH',
		})
		const data = (await response
			.json()
			.catch(() => null)) as ProfileResponse | null

		if (!response.ok) {
			throw new Error(
				response.status === 409
					? t('auth.profile.emailInUse')
					: (data?.error ?? t('auth.profile.profileUpdateFailed')),
			)
		}

		return data ?? {}
	}

	async function changePassword(values: ProfileSettingsValues) {
		const response = await fetch('/api/auth/change-password', {
			body: JSON.stringify({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
				revokeOtherSessions: false,
			}),
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
		})

		if (!response.ok) {
			throw new Error(t('auth.profile.passwordChangeFailed'))
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<h1 className="text-3xl font-bold tracking-tight md:text-4xl">
				{t('auth.profile.settings')}
			</h1>
			<div className="mt-8 grid gap-5">
				<ProfileFormField
					autoComplete="name"
					error={errors.name}
					label={t('auth.name.label')}
					registration={register('name', {
						required: t('auth.nameTooShort'),
					})}
				/>

				<ProfileFormField
					autoComplete="email"
					error={errors.email}
					label={t('auth.email')}
					registration={register('email', {
						required: t('auth.invalidEmail'),
					})}
					type="email"
				/>

				<div className="grid gap-3">
					<p className="text-sm font-semibold text-(--color-app-text-secondary)">
						{t('auth.profile.password')}
					</p>
					<ProfileFormField
						autoComplete="current-password"
						placeholder={t('auth.profile.currentPassword')}
						registration={register('currentPassword')}
						type="password"
					/>
					<ProfileFormField
						autoComplete="new-password"
						placeholder={t('auth.profile.newPassword')}
						registration={register('newPassword')}
						type="password"
					/>
					<ProfileFormField
						autoComplete="new-password"
						placeholder={t('auth.profile.confirmPassword')}
						registration={register('confirmPassword')}
						type="password"
					/>
					<p className="text-sm leading-6 text-(--color-app-text-muted)">
						{t('auth.profile.passwordHelp')}
					</p>
				</div>
			</div>
			<button
				type="submit"
				disabled={isSubmitting}
				className="focus-ring gradient-button gradient-button-glow mt-8 min-h-12 w-full cursor-pointer rounded-(--radius-button) px-5 text-sm font-bold text-(--color-app-text) transition disabled:cursor-not-allowed disabled:opacity-60 md:max-w-md"
			>
				{t('auth.profile.save')}
			</button>
		</form>
	)
}
