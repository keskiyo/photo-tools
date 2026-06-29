'use client'

import { Globe2 } from 'lucide-react'

import { useLocalization, type Locale } from '@/localization'

const languages = [
	{ value: 'ru', label: 'RU' },
	{ value: 'eu', label: 'EU' },
] as const

type LanguageSelectProps = {
	value?: Locale
	onChange?: (language: Locale) => void
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
	const { locale, setLocale, t } = useLocalization()
	const language = value ?? locale

	function updateLanguage(nextLanguage: Locale) {
		setLocale(nextLanguage)
		onChange?.(nextLanguage)
	}

	return (
		<label className='focus-ring flex min-h-11 items-center gap-2 rounded-(--radius-button) border border-(--color-app-border) bg-(--color-app-surface) px-3 text-sm font-semibold text-(--color-app-text-secondary)'>
			<Globe2
				aria-hidden='true'
				className='h-4 w-4 text-(--color-app-accent)'
			/>
			<span className='sr-only'>{t('language.label')}</span>
			<select
				value={language}
				onChange={event => updateLanguage(event.target.value as Locale)}
				className='cursor-pointer bg-transparent text-(--color-app-text) outline-none'
				aria-label={t('language.label')}
			>
				{languages.map(item => (
					<option key={item.value} value={item.value}>
						{item.label}
					</option>
				))}
			</select>
		</label>
	)
}
