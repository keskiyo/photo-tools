import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins'

import { prisma } from '@/lib/prisma'

// User ids listed here are always treated as admins regardless of their stored
// role — used to bootstrap the first admin. Comma-separated in ADMIN_USER_IDS.
const adminUserIds = (process.env.ADMIN_USER_IDS ?? '')
	.split(',')
	.map(id => id.trim())
	.filter(Boolean)

/** True when the user is an admin by stored role or bootstrap id list. */
export async function isAdminUser(userId: string) {
	console.log('🔍 Checking admin for userId:', userId)

	if (adminUserIds.includes(userId)) {
		console.log('✅ Admin by ID list')
		return true
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true },
	})

	console.log('📦 DB User role:', user?.role)
	const result = user?.role === 'admin'
	console.log(result ? '✅ Is ADMIN' : ' Not admin')

	return result
}

export const auth = betterAuth({
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
	basePath: '/api/auth',
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24,
	},
	emailAndPassword: {
		enabled: true,
	},
	trustedOrigins: [
		process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
		'http://localhost:3000',
	],
	plugins: [
		admin({
			defaultRole: 'user',
			adminRoles: ['admin'],
			adminUserIds,
		}),
	],
})
