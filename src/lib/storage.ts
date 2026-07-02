import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'

import type { ProcessedImageType } from '@/types/processed-image'

type StorageKind = 'generated' | 'uploads'

type BuildStorageKeyInput = {
	kind: StorageKind
	type: ProcessedImageType
	extension: string
	now?: number
	id?: string
}

type SaveStorageFileInput = {
	key: string
	buffer: Buffer
	contentType: string
}

const LOCAL_PUBLIC_DIR = path.join(process.cwd(), 'public')

let s3Client: S3Client | null = null

export function buildStorageKey({
	kind,
	type,
	extension,
	now = Date.now(),
	id = crypto.randomUUID(),
}: BuildStorageKeyInput) {
	const safeExtension = normalizeExtension(extension)
	return `${kind}/${type}/${now}-${id}.${safeExtension}`
}

export function getPublicStorageUrl(
	key: string,
	publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL,
) {
	const normalizedKey = key.replace(/^\/+/, '')
	if (!publicBaseUrl) return `/${normalizedKey}`
	return `${publicBaseUrl.replace(/\/+$/, '')}/${normalizedKey}`
}

export async function saveStorageFile({
	key,
	buffer,
	contentType,
}: SaveStorageFileInput) {
	if (isS3StorageConfigured()) {
		await getS3Client().send(
			new PutObjectCommand({
				Bucket: process.env.S3_BUCKET!,
				Key: key,
				Body: buffer,
				ContentType: contentType,
			}),
		)
		return getPublicStorageUrl(key)
	}

	const localPath = resolveLocalStoragePath(key)
	await mkdir(path.dirname(localPath), { recursive: true })
	await writeFile(localPath, buffer)
	return getPublicStorageUrl(key)
}

export async function readStorageFile(key: string) {
	if (isS3StorageConfigured()) {
		const response = await getS3Client().send(
			new GetObjectCommand({
				Bucket: process.env.S3_BUCKET!,
				Key: key,
			}),
		)
		if (!response.Body) {
			throw new Error(`Storage object is empty: ${key}`)
		}
		return streamToBuffer(response.Body)
	}

	return readFile(resolveLocalStoragePath(key))
}

export function getContentTypeForExtension(extension: string) {
	const normalized = normalizeExtension(extension)
	if (normalized === 'jpg' || normalized === 'jpeg') return 'image/jpeg'
	if (normalized === 'png') return 'image/png'
	if (normalized === 'webp') return 'image/webp'
	return 'application/octet-stream'
}

function normalizeExtension(extension: string) {
	const safeExtension = extension.replace(/[^a-z0-9]/gi, '').toLowerCase()
	return safeExtension || 'bin'
}

function resolveLocalStoragePath(key: string) {
	const normalizedKey = key.replace(/^\/+/, '')
	const targetPath = path.resolve(LOCAL_PUBLIC_DIR, normalizedKey)
	const publicRoot = path.resolve(LOCAL_PUBLIC_DIR)
	if (!targetPath.startsWith(publicRoot + path.sep)) {
		throw new Error('Storage key escapes the public directory')
	}
	return targetPath
}

export function resolveStorageMode(
	env: Record<string, string | undefined> = process.env,
) {
	return env.S3_BUCKET &&
		env.S3_REGION &&
		env.S3_ACCESS_KEY_ID &&
		env.S3_SECRET_ACCESS_KEY
		? 's3'
		: 'local'
}

function isS3StorageConfigured() {
	return resolveStorageMode() === 's3'
}

function getS3Client() {
	s3Client ??= new S3Client({
		region: process.env.S3_REGION,
		endpoint: process.env.S3_ENDPOINT,
		forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID!,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
		},
	})
	return s3Client
}

async function streamToBuffer(body: unknown) {
	if (body instanceof Uint8Array) return Buffer.from(body)
	if (body instanceof Readable) {
		const chunks: Buffer[] = []
		for await (const chunk of body) {
			chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
		}
		return Buffer.concat(chunks)
	}
	if (
		typeof body === 'object' &&
		body !== null &&
		'transformToByteArray' in body &&
		typeof body.transformToByteArray === 'function'
	) {
		return Buffer.from(await body.transformToByteArray())
	}
	throw new Error('Unsupported storage body stream')
}
