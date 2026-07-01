import { spawn, execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const packageRunner = resolvePackageRunner()
const redisContainerName = 'phototools-redis'
const env = { ...process.env, ...(await readDotEnv()) }
const redisUrl = env.REDIS_URL
let redisReady = false

if (redisUrl) {
	redisReady = await ensureLocalRedis(redisUrl)
} else {
	console.warn(
		'REDIS_URL is missing. The app will run, but image jobs will use inline processing.',
	)
}

if (!redisReady) {
	delete env.REDIS_URL
	console.warn(
		'Redis is not available. Starting Next.js only; image jobs will use inline processing.',
	)
}

const children = [
	startProcess('next', ['run', 'dev'], env),
	...(redisReady ? [startProcess('worker', ['run', 'worker:image'], env)] : []),
]

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, () => {
		for (const child of children) {
			child.kill(signal)
		}
		process.exit(0)
	})
}

let exited = false
for (const child of children) {
	child.on('exit', code => {
		if (exited) return
		exited = true
		for (const other of children) {
			if (other !== child) other.kill()
		}
		process.exit(code ?? 1)
	})
}

async function readDotEnv() {
	try {
		const content = await readFile('.env', 'utf8')
		const values = {}
		for (const rawLine of content.split(/\r?\n/)) {
			const line = rawLine.trim()
			if (!line || line.startsWith('#')) continue
			const separator = line.indexOf('=')
			if (separator === -1) continue

			const key = line.slice(0, separator).trim()
			let value = line.slice(separator + 1).trim()
			value = value.replace(/^['"]|['"]$/g, '')
			values[key] = value
		}
		return values
	} catch {
		return {}
	}
}

function startProcess(label, args, childEnv) {
	const child = spawn(
		packageRunner.command,
		[...packageRunner.prefixArgs, ...args],
		{
			env: childEnv,
			stdio: ['inherit', 'pipe', 'pipe'],
			shell: false,
		},
	)

	child.stdout.on('data', chunk => writePrefixed(label, chunk))
	child.stderr.on('data', chunk => writePrefixed(label, chunk, true))
	return child
}

function resolvePackageRunner() {
	const npmExecPath = process.env.npm_execpath
	if (npmExecPath?.toLowerCase().includes('yarn')) {
		return { command: process.execPath, prefixArgs: [npmExecPath] }
	}

	const localYarnPath = path.join(
		process.cwd(),
		'node_modules',
		'yarn',
		'bin',
		'yarn.js',
	)
	if (existsSync(localYarnPath)) {
		return { command: process.execPath, prefixArgs: [localYarnPath] }
	}

	return {
		command: process.platform === 'win32' ? 'yarn.cmd' : 'yarn',
		prefixArgs: [],
	}
}

function writePrefixed(label, chunk, isError = false) {
	const lines = chunk.toString().split(/\r?\n/)
	for (const line of lines) {
		if (!line) continue
		const output = `[${label}] ${line}\n`
		if (isError) process.stderr.write(output)
		else process.stdout.write(output)
	}
}

async function ensureLocalRedis(urlValue) {
	const parsed = new URL(urlValue)
	const isLocalhost =
		parsed.hostname === 'localhost' ||
		parsed.hostname === '127.0.0.1' ||
		parsed.hostname === '::1'
	if (!isLocalhost) return

	const port = Number.parseInt(parsed.port || '6379', 10)
	if (await canConnect(parsed.hostname, port)) return true

	try {
		await execFileAsync('docker', ['start', redisContainerName])
	} catch {
		try {
			await execFileAsync('docker', [
				'run',
				'-d',
				'--name',
				redisContainerName,
				'-p',
				`${port}:6379`,
				'redis:7-alpine',
			])
		} catch (error) {
			console.warn(
				`Could not start local Redis with Docker. Start Redis manually for ${urlValue}.`,
			)
			if (error instanceof Error) console.warn(error.message)
			return false
		}
	}

	return waitForRedis(parsed.hostname, port)
}

function canConnect(host, port) {
	return new Promise(resolve => {
		const socket = net.createConnection({ host, port })
		const done = result => {
			socket.destroy()
			resolve(result)
		}
		socket.setTimeout(1000)
		socket.once('connect', () => done(true))
		socket.once('timeout', () => done(false))
		socket.once('error', () => done(false))
	})
}

async function waitForRedis(host, port) {
	for (let attempt = 0; attempt < 20; attempt += 1) {
		if (await canConnect(host, port)) return true
		await new Promise(resolve => setTimeout(resolve, 250))
	}
	console.warn(
		'Redis container started, but the port did not become ready in time.',
	)
	return false
}
