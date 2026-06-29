import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

import { prisma } from '@/lib/prisma'

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
})
