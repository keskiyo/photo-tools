export type ProfileHistoryImage = {
	id: string
	prompt: string | null
	resultUrl: string
	createdAt: string
}

export type ProfileUser = {
	name: string
	email: string
}

export type ProfileSettingsValues = {
	confirmPassword: string
	currentPassword: string
	email: string
	name: string
	newPassword: string
}

export type ProfileView = 'history' | 'settings'
