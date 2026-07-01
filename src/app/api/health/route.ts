import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

// Always evaluate fresh — a cached health check is useless for uptime gating.
export const dynamic = 'force-dynamic'

/**
 * Lightweight liveness/readiness probe. Returns 200 when the database is
 * reachable, 503 otherwise. No internals are leaked in the response body.
 */
export async function GET() {
	let database: 'up' | 'down' = 'up'
	try {
		await prisma.$queryRaw`SELECT 1`
	} catch (error) {
		database = 'down'
		console.error(
			'Health check: database unreachable',
			error instanceof Error ? error.message : 'unknown error',
		)
	}

	const ok = database === 'up'
	return NextResponse.json(
		{
			status: ok ? 'ok' : 'degraded',
			database,
			redis: process.env.REDIS_URL ? 'configured' : 'inline',
			storage: process.env.S3_BUCKET ? 's3' : 'local',
			timestamp: new Date().toISOString(),
		},
		{ status: ok ? 200 : 503 },
	)
}
