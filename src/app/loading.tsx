import { getTranslations } from 'next-intl/server'

import { AppLoader } from '@/components/ui/app-loader'

export default async function Loading() {
	const t = await getTranslations()
	return (
		<div className='app-shell flex min-h-screen items-center justify-center'>
			<AppLoader label={t('common.loading')} />
		</div>
	)
}
