'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useRef } from 'react'

declare global {
	interface Window {
		ym?: (
			counterId: number,
			action: 'init' | 'hit',
			options?: Record<string, unknown> | string,
		) => void
	}
}

type YandexMetrikaProps = {
	counterId?: string
}

export function YandexMetrika({ counterId }: YandexMetrikaProps) {
	const pathname = usePathname()
	const mounted = useRef(false)
	const parsedCounterId = Number.parseInt(counterId ?? '', 10)

	useEffect(() => {
		if (!Number.isFinite(parsedCounterId) || !window.ym) return
		if (!mounted.current) {
			mounted.current = true
			return
		}

		window.ym(parsedCounterId, 'hit', window.location.href)
	}, [parsedCounterId, pathname])

	if (!Number.isFinite(parsedCounterId)) {
		return null
	}

	return (
		<>
			<Script id='yandex-metrika' strategy='afterInteractive'>
				{`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${parsedCounterId}, "init", {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true
          });
        `}
			</Script>
			<noscript>
				<div>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={`https://mc.yandex.ru/watch/${parsedCounterId}`}
						style={{ position: 'absolute', left: '-9999px' }}
						alt=''
					/>
				</div>
			</noscript>
		</>
	)
}
