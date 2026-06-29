import { appendFile, mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'

const LOGS_DIR = path.join(process.cwd(), 'logs')
const MOSCOW_TIME_ZONE = 'Europe/Moscow'
const ENTRY_SEPARATOR = '='.repeat(72)
const LOG_FILE_PATTERN = /^prompts-(\d{4})-(\d{2})-(\d{2})\.log$/
const LOG_RETENTION_DAYS = 30
const PRUNE_INTERVAL_MS = 60 * 60 * 1000 // prune at most once per hour
const DAY_MS = 24 * 60 * 60 * 1000

let lastPruneAt = 0

export type PromptLogUser = {
	name?: string | null
	email?: string | null
}

export type PromptLogEntry = {
	actor: string
	prompt: string
	type: string
	userId?: string | null
	style?: string
	aspectRatio?: string
	timestamp?: Date
}

/**
 * Formats a date as "YYYY-MM-DD HH:mm:ss" in Moscow time (UTC+3).
 * Uses Intl so the offset stays correct regardless of the server time zone.
 */
export function formatMoscowTimestamp(date: Date): string {
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone: MOSCOW_TIME_ZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	}).formatToParts(date)

	const get = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find(part => part.type === type)?.value ?? '00'

	return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
}

/** Moscow calendar date "YYYY-MM-DD", used for the daily log file name. */
export function moscowDateStamp(date: Date): string {
	return formatMoscowTimestamp(date).slice(0, 10)
}

/** Builds an anonymous actor id with a 16-digit numeric suffix. */
export function generateAlienId(): string {
	const firstDigit = String(Math.floor(Math.random() * 9) + 1)
	const rest = Array.from({ length: 15 }, () =>
		String(Math.floor(Math.random() * 10)),
	).join('')

	return `\u043f\u0440\u0438\u0448\u0435\u043b\u0435\u0446-${firstDigit}${rest}`
}

/**
 * Resolves how the actor is written in the log.
 * Registered users get "name <email>"; anonymous users get an alien id.
 */
export function resolveLogActor(user?: PromptLogUser | null): string {
	const email = user?.email?.trim()
	if (!email) {
		return generateAlienId()
	}

	const name = user?.name?.trim()
	return name ? `${name} <${email}>` : `<${email}>`
}

/**
 * Collapses newlines/carriage returns so an attacker-controlled prompt cannot
 * forge separator lines or fake log blocks (log injection). One entry = one block.
 */
export function sanitizePromptForLog(prompt: string): string {
	return prompt.replace(/\r\n?|\n/g, '\\n')
}

/** Renders one log block with a clear separator, MSK timestamp, actor and prompt. */
export function formatPromptLogEntry(entry: PromptLogEntry): string {
	const timestamp = formatMoscowTimestamp(entry.timestamp ?? new Date())
	const meta = [`Type: ${entry.type}`]
	if (entry.userId) meta.push(`UserId: ${entry.userId}`)
	if (entry.style) meta.push(`Style: ${entry.style}`)
	if (entry.aspectRatio) meta.push(`Aspect: ${entry.aspectRatio}`)

	return [
		ENTRY_SEPARATOR,
		`[${timestamp} MSK] ${entry.actor}`,
		meta.join(' | '),
		`Prompt: ${sanitizePromptForLog(entry.prompt)}`,
		ENTRY_SEPARATOR,
		'',
	].join('\n')
}

/**
 * Decides whether a daily log file is past the retention window.
 * Returns false for any file name that is not a dated prompt log.
 */
export function isExpiredLogFile(
	fileName: string,
	maxAgeDays: number,
	now: Date,
): boolean {
	const match = LOG_FILE_PATTERN.exec(fileName)
	if (!match) return false

	const fileTime = Date.UTC(
		Number(match[1]),
		Number(match[2]) - 1,
		Number(match[3]),
	)
	return now.getTime() - fileTime > maxAgeDays * DAY_MS
}

/** Deletes dated prompt-log files older than `maxAgeDays`. Never throws. */
export async function prunePromptLogs(
	maxAgeDays = LOG_RETENTION_DAYS,
	now = new Date(),
): Promise<void> {
	try {
		const files = await readdir(LOGS_DIR)
		await Promise.all(
			files
				.filter(file => isExpiredLogFile(file, maxAgeDays, now))
				.map(file => rm(path.join(LOGS_DIR, file), { force: true })),
		)
	} catch (error) {
		if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
			console.error('Failed to prune prompt logs', error)
		}
	}
}

/**
 * Appends a prompt log block to logs/prompts-YYYY-MM-DD.log (Moscow date).
 * Never throws: logging must not break generation.
 */
export async function appendPromptLog(entry: PromptLogEntry): Promise<void> {
	try {
		const date = entry.timestamp ?? new Date()
		const fileName = `prompts-${moscowDateStamp(date)}.log`
		await mkdir(LOGS_DIR, { recursive: true })
		await appendFile(
			path.join(LOGS_DIR, fileName),
			formatPromptLogEntry({ ...entry, timestamp: date }),
			'utf8',
		)

		const nowMs = Date.now()
		if (nowMs - lastPruneAt > PRUNE_INTERVAL_MS) {
			lastPruneAt = nowMs
			void prunePromptLogs()
		}
	} catch (error) {
		console.error('Failed to write prompt log', error)
	}
}
