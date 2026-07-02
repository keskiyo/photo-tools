'use client'

import { ChevronDown, Globe2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'

import { setUserLocale } from '@/i18n/locale-action'
import type { AppLocale } from '@/i18n/request'

const languages = [
	{ value: 'ru', label: 'RU' },
	{ value: 'en', label: 'EN' },
] as const

type MenuPosition = { top: number; right: number; minWidth: number }

export function LanguageSelect() {
	const locale = useLocale() as AppLocale
	const t = useTranslations()
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [isOpen, setIsOpen] = useState(false)
	const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		if (!isOpen) return
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') setIsOpen(false)
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [isOpen])

	function toggleOpen() {
		if (!isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect()
			setMenuPosition({
				top: rect.bottom + 8,
				right: window.innerWidth - rect.right,
				minWidth: rect.width,
			})
		}
		setIsOpen(open => !open)
	}

	function selectLanguage(nextLanguage: AppLocale) {
		setIsOpen(false)
		if (nextLanguage === locale) return
		startTransition(async () => {
			await setUserLocale(nextLanguage)
			router.refresh()
		})
	}

	const currentLabel =
		languages.find(item => item.value === locale)?.label ?? locale

	return (
		<div className="relative">
			<button
				ref={buttonRef}
				type="button"
				onClick={toggleOpen}
				disabled={isPending}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-label={t('language.label')}
				className="focus-ring flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-(--radius-button) border border-(--color-app-border) bg-(--color-app-surface) px-3 text-sm font-semibold text-(--color-app-text-secondary)"
			>
				<Globe2
					aria-hidden="true"
					className="h-4 w-4 shrink-0 text-(--color-app-accent)"
				/>
				<span className="text-(--color-app-text)">{currentLabel}</span>
				<ChevronDown
					aria-hidden="true"
					className={`h-4 w-4 shrink-0 transition-transform ${
						isOpen ? 'rotate-180' : 'rotate-0'
					}`}
				/>
			</button>

			{isOpen && menuPosition
				? createPortal(
						<>
							{/* Backdrop: any outside click closes the menu. */}
							<button
								type="button"
								aria-hidden="true"
								tabIndex={-1}
								onClick={() => setIsOpen(false)}
								className="fixed inset-0 z-1000 cursor-default"
							/>
							<ul
								role="listbox"
								aria-label={t('language.label')}
								style={{
									top: menuPosition.top,
									right: menuPosition.right,
									minWidth: menuPosition.minWidth,
								}}
								className="fixed z-1001 overflow-hidden rounded-(--radius-button) border border-(--color-app-border) bg-(--color-app-surface) shadow-(--shadow-card)"
							>
								{languages.map(item => {
									const isActive = item.value === locale
									return (
										<li key={item.value} role="option" aria-selected={isActive}>
											<button
												type="button"
												onClick={() => selectLanguage(item.value)}
												className={`focus-ring block w-full cursor-pointer px-4 py-2 text-center text-sm font-semibold transition-colors ${
													isActive
														? 'bg-(--gradient-app-soft) text-(--color-app-accent)'
														: 'text-(--color-app-text-secondary) hover:bg-(--color-app-surface-light) hover:text-(--color-app-text)'
												}`}
											>
												{item.label}
											</button>
										</li>
									)
								})}
							</ul>
						</>,
						document.body,
					)
				: null}
		</div>
	)
}
