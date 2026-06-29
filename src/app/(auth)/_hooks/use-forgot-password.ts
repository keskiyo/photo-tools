'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { useLocalization } from '@/localization'

/**
 * "Forgot password" action: sends a reset code, then routes to the code page.
 * Always navigates (even on unknown email) to avoid account enumeration.
 */
export function useForgotPassword() {
	const { t } = useLocalization()
	const router = useRouter()
	const [isSendingReset, setIsSendingReset] = useState(false)

	async function requestReset(email: string) {
		const trimmedEmail = email.trim()
		if (!z.email().safeParse(trimmedEmail).success) {
			toast.error(t('common.checkForm'))
			return
		}

		setIsSendingReset(true)
		try {
			await fetch('/api/password-reset/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: trimmedEmail }),
			})
			router.push(
				`/reset-password/verify?email=${encodeURIComponent(trimmedEmail)}`,
			)
		} catch {
			toast.error(t('common.checkForm'))
		} finally {
			setIsSendingReset(false)
		}
	}

	return { isSendingReset, requestReset }
}
