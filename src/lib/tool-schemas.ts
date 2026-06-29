import { z } from 'zod'

export const backgroundRemoverSchema = z.object({
	fileName: z.string().trim().min(1),
})

export type BackgroundRemoverValues = z.infer<typeof backgroundRemoverSchema>

/** Shared source of truth for AI generator options (client form + API route). */
export const AI_STYLES = [
	'none',
	'product',
	'cinematic',
	'editorial',
	'minimal',
	'portrait',
	'anime',
	'watercolor',
	'render3d',
	'vintage',
	'cyberpunk',
	'fantasy',
	'popart',
] as const

export const AI_ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3'] as const

export type AiStyle = (typeof AI_STYLES)[number]
export type AiAspectRatio = (typeof AI_ASPECT_RATIOS)[number]

export const PROMPT_MIN_LENGTH = 8
export const PROMPT_MAX_LENGTH = 1000

/** Validates the JSON body of POST /api/generate. */
export const generateRequestSchema = z.object({
	prompt: z.string().trim().min(PROMPT_MIN_LENGTH).max(PROMPT_MAX_LENGTH),
	style: z.enum(AI_STYLES).default('none'),
	aspectRatio: z.enum(AI_ASPECT_RATIOS).default('1:1'),
})

export type GenerateRequest = z.infer<typeof generateRequestSchema>

/** Client-side form schema for the converter tool. */
export const converterSchema = z.object({
	format: z.enum(['jpeg', 'png', 'webp']),
	width: z.coerce.number().int().positive().optional().or(z.literal('')),
	height: z.coerce.number().int().positive().optional().or(z.literal('')),
	preserveAspectRatio: z.boolean(),
})

export type ConverterFormValues = z.infer<typeof converterSchema>
