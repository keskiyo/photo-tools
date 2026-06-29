import { randomUUID } from 'node:crypto'

export { ANONYMOUS_OWNER_COOKIE } from '@/lib/app-cookies'

export function createAnonymousOwnerId() {
	return `anon_${randomUUID()}`
}
