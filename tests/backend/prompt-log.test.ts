import { describe, expect, it } from 'vitest'

import {
	formatMoscowTimestamp,
	formatPromptLogEntry,
	generateAlienId,
	isExpiredLogFile,
	moscowDateStamp,
	resolveLogActor,
	sanitizePromptForLog,
} from '@/lib/prompt-log'

describe('formatMoscowTimestamp', () => {
	it('converts a UTC instant to Moscow time (UTC+3)', () => {
		const date = new Date('2026-06-28T12:00:00Z')
		expect(formatMoscowTimestamp(date)).toBe('2026-06-28 15:00:00')
	})

	it('rolls over to the next Moscow day past midnight', () => {
		const date = new Date('2026-06-28T22:30:00Z')
		expect(formatMoscowTimestamp(date)).toBe('2026-06-29 01:30:00')
	})
})

describe('moscowDateStamp', () => {
	it('returns the Moscow calendar date', () => {
		expect(moscowDateStamp(new Date('2026-06-28T22:30:00Z'))).toBe(
			'2026-06-29',
		)
	})
})

describe('generateAlienId', () => {
	it('builds an alien id with a 16-digit number', () => {
		for (let i = 0; i < 50; i += 1) {
			const id = generateAlienId()
			expect(id).toMatch(/^пришелец-[1-9]\d{15}$/)
		}
	})

	it('produces varying ids', () => {
		expect(generateAlienId()).not.toBe(generateAlienId())
	})
})

describe('resolveLogActor', () => {
	it('writes name and email for a registered user', () => {
		expect(
			resolveLogActor({ name: 'Иван Иванов', email: 'ivan@mail.ru' }),
		).toBe('Иван Иванов <ivan@mail.ru>')
	})

	it('writes only the email when the name is missing', () => {
		expect(resolveLogActor({ email: 'ivan@mail.ru' })).toBe(
			'<ivan@mail.ru>',
		)
	})

	it('falls back to an alien id when there is no user', () => {
		expect(resolveLogActor(null)).toMatch(/^пришелец-[1-9]\d{15}$/)
	})

	it('falls back to an alien id when the email is empty', () => {
		expect(resolveLogActor({ name: 'Ghost', email: '  ' })).toMatch(
			/^пришелец-[1-9]\d{15}$/,
		)
	})
})

describe('formatPromptLogEntry', () => {
	const entry = formatPromptLogEntry({
		actor: 'Иван Иванов <ivan@mail.ru>',
		prompt: 'neon cat in the rain',
		type: 'ai_gen',
		style: 'cyberpunk',
		aspectRatio: '16:9',
		timestamp: new Date('2026-06-28T12:00:00Z'),
	})

	it('includes the MSK timestamp, actor and prompt', () => {
		expect(entry).toContain(
			'[2026-06-28 15:00:00 MSK] Иван Иванов <ivan@mail.ru>',
		)
		expect(entry).toContain('Prompt: neon cat in the rain')
	})

	it('includes type, style and aspect metadata', () => {
		expect(entry).toContain(
			'Type: ai_gen | Style: cyberpunk | Aspect: 16:9',
		)
	})

	it('wraps each entry in clear separators', () => {
		const separator = '='.repeat(72)
		const occurrences = entry.split(separator).length - 1
		expect(occurrences).toBe(2)
		expect(entry.startsWith(separator)).toBe(true)
	})

	it('omits style and aspect when not provided', () => {
		const minimal = formatPromptLogEntry({
			actor: 'пришелец-1234567890123456',
			prompt: 'hello',
			type: 'ai_gen',
			timestamp: new Date('2026-06-28T12:00:00Z'),
		})
		expect(minimal).toContain('Type: ai_gen')
		expect(minimal).not.toContain('Style:')
		expect(minimal).not.toContain('Aspect:')
	})

	it('includes the user id in metadata when provided', () => {
		const withUser = formatPromptLogEntry({
			actor: 'Иван <ivan@mail.ru>',
			userId: 'user_42',
			prompt: 'hello',
			type: 'ai_gen',
			timestamp: new Date('2026-06-28T12:00:00Z'),
		})
		expect(withUser).toContain('UserId: user_42')
	})
})

describe('sanitizePromptForLog', () => {
	it('escapes newlines so a prompt cannot forge log lines', () => {
		const malicious =
			'ok\n========================================================================\n[fake] ADMIN'
		expect(sanitizePromptForLog(malicious)).not.toContain('\n')
		expect(sanitizePromptForLog('a\r\nb\rc')).toBe('a\\nb\\nc')
	})

	it('keeps a multiline prompt as a single log block', () => {
		const entry = formatPromptLogEntry({
			actor: 'пришелец-1234567890123456',
			prompt: 'line one\nline two',
			type: 'ai_gen',
			timestamp: new Date('2026-06-28T12:00:00Z'),
		})
		const separator = '='.repeat(72)
		expect(entry.split(separator).length - 1).toBe(2)
		expect(entry).toContain('Prompt: line one\\nline two')
	})
})

describe('isExpiredLogFile', () => {
	const now = new Date('2026-06-28T00:00:00Z')

	it('flags dated log files older than the retention window', () => {
		expect(isExpiredLogFile('prompts-2026-05-01.log', 30, now)).toBe(true)
	})

	it('keeps files within the retention window', () => {
		expect(isExpiredLogFile('prompts-2026-06-20.log', 30, now)).toBe(false)
		expect(isExpiredLogFile('prompts-2026-06-28.log', 30, now)).toBe(false)
	})

	it('ignores files that are not dated prompt logs', () => {
		expect(isExpiredLogFile('notes.txt', 30, now)).toBe(false)
		expect(isExpiredLogFile('prompts-latest.log', 30, now)).toBe(false)
	})
})
