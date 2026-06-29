import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const port = Number.parseInt(process.argv[2] ?? '3000', 10)

if (!Number.isFinite(port) || port < 1 || port > 65535) {
	console.error('Usage: node scripts/kill-port.mjs <port>')
	process.exit(1)
}

if (process.platform === 'win32') {
	await killWindowsPort(port)
} else {
	await killUnixPort(port)
}

async function killWindowsPort(targetPort) {
	const { stdout } = await execFileAsync('netstat.exe', ['-ano', '-p', 'tcp'])
	const pids = new Set()

	for (const line of stdout.split(/\r?\n/)) {
		const parts = line.trim().split(/\s+/)
		const [protocol, localAddress, , state, pid] = parts
		if (
			protocol?.toLowerCase() === 'tcp' &&
			state === 'LISTENING' &&
			localAddress?.endsWith(`:${targetPort}`)
		) {
			const parsedPid = Number.parseInt(pid, 10)
			if (Number.isFinite(parsedPid) && parsedPid !== process.pid) {
				pids.add(parsedPid)
			}
		}
	}

	for (const pid of pids) {
		try {
			await execFileAsync('taskkill.exe', ['/PID', String(pid), '/F'])
			console.log(`Stopped process ${pid}`)
		} catch {
			// If the process exited between netstat and taskkill, the port is already free.
		}
	}
}

async function killUnixPort(targetPort) {
	try {
		const { stdout } = await execFileAsync('lsof', [
			'-ti',
			`tcp:${targetPort}`,
		])
		const pids = stdout
			.split(/\s+/)
			.map(pid => Number.parseInt(pid, 10))
			.filter(pid => Number.isFinite(pid) && pid !== process.pid)

		for (const pid of pids) {
			process.kill(pid, 'SIGTERM')
			console.log(`Stopped process ${pid}`)
		}
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error) {
			return
		}
		throw error
	}
}
