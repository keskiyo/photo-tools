'use client'

import { useTranslations } from 'next-intl'

import { Cookie } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
	COOKIE_CONSENT_COOKIE,
	LEGACY_COOKIE_CONSENT_COOKIE,
} from '@/lib/app-cookies'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function CookieConsent({
	initialIsVisible,
}: {
	initialIsVisible: boolean
}) {
	const t = useTranslations()
	const [isVisible, setIsVisible] = useState(initialIsVisible)

	useEffect(() => {
		const legacyValue = getCookieValue(LEGACY_COOKIE_CONSENT_COOKIE)
		if (legacyValue && !getCookieValue(COOKIE_CONSENT_COOKIE)) {
			document.cookie = `${COOKIE_CONSENT_COOKIE}=${legacyValue}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
		}
		deleteCookie(LEGACY_COOKIE_CONSENT_COOKIE)
	}, [])

	function saveConsent(value: 'accepted' | 'declined') {
		document.cookie = `${COOKIE_CONSENT_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
		deleteCookie(LEGACY_COOKIE_CONSENT_COOKIE)
		setIsVisible(false)
	}

	if (!isVisible) {
		return null
	}

	return (
		<section
			aria-label={t('cookies.title')}
			className='fixed inset-x-0 bottom-0 z-60 border-t border-(--color-app-border) bg-[color-mix(in_srgb,var(--color-app-bg)_92%,transparent)] px-4 py-4 backdrop-blur-2xl'
		>
			<div className='app-container flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
				<div className='flex gap-3'>
					<span className='mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-(--radius-button) bg-(--gradient-app-soft) text-(--color-app-accent)'>
						<Cookie aria-hidden='true' className='h-5 w-5' />
					</span>
					<div>
						<h2 className='text-base font-semibold'>
							{t('cookies.title')}
						</h2>
						<p className='mt-1 max-w-3xl text-sm leading-6 text-(--color-app-text-secondary)'>
							{t('cookies.description')}
						</p>
					</div>
				</div>
				<div className='flex shrink-0 gap-3'>
					<button
						type='button'
						onClick={() => saveConsent('declined')}
						className='focus-ring min-h-11 cursor-pointer rounded-(--radius-button) border border-(--color-app-border) bg-(--color-app-surface) px-5 text-sm font-semibold text-(--color-app-text-secondary) transition hover:text-(--color-app-text)'
					>
						{t('cookies.decline')}
					</button>
					<button
						type='button'
						onClick={() => saveConsent('accepted')}
						className='focus-ring gradient-button min-h-11 cursor-pointer rounded-(--radius-button) px-5 text-sm font-semibold'
					>
						{t('cookies.accept')}
					</button>
				</div>
			</div>
		</section>
	)
}

function deleteCookie(name: string) {
	document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
}

function getCookieValue(name: string) {
	const cookie = document.cookie
		.split('; ')
		.find(item => item.startsWith(`${name}=`))
	return cookie
		? decodeURIComponent(cookie.split('=').slice(1).join('='))
		: null
}
