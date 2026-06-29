import { AppLoader } from '@/components/ui/app-loader'
import { T } from '@/localization'

export default function Loading() {
	return (
		<div className='app-shell flex min-h-screen items-center justify-center'>
			<AppLoader label={<T k='common.loading' />} />
		</div>
	)
}
