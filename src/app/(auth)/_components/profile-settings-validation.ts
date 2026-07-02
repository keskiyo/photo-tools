import type { useTranslations } from 'next-intl'

import { toast } from 'react-toastify'

import type { ProfileSettingsValues } from '../_types/profile'

type Translator = ReturnType<typeof useTranslations>

export function validatePasswordChange(
	values: ProfileSettingsValues,
	wantsPasswordChange: boolean,
	t: Translator,
) {
	if (!wantsPasswordChange) return true

	if (!values.currentPassword) {
		toast.error(t('auth.profile.currentPasswordRequired'))
		return false
	}

	if (values.newPassword.length < 8) {
		toast.error(t('auth.passwordTooShort'))
		return false
	}

	if (values.newPassword !== values.confirmPassword) {
		toast.error(t('auth.passwordsMismatch'))
		return false
	}

	return true
}
