type Block =
	| { type: 'heading'; text: string }
	| { type: 'paragraph'; text: string }
	| { type: 'list'; items: string[] }

const HEADING = /^\d+\.\s/
const CLAUSE = /^\d+\.\d/
const BULLET = /^([•–*]|-\s|-(?=[А-ЯA-Z]))/

function parse(content: string): Block[] {
	const blocks: Block[] = []
	let list: string[] | null = null

	const flushList = () => {
		if (list) {
			blocks.push({ type: 'list', items: list })
			list = null
		}
	}

	for (const raw of content.split('\n')) {
		const line = raw.trim()
		if (!line) continue

		if (HEADING.test(line) && !CLAUSE.test(line)) {
			flushList()
			blocks.push({ type: 'heading', text: line })
			continue
		}

		const isBullet =
			BULLET.test(line) || CLAUSE.test(line) || /^\s{2,}\S/.test(raw)
		if (isBullet) {
			const item = line.replace(/^(\d+(\.\d+)*\.|[•–*]|-)\s*/, '').trim()
			if (!list) list = []
			list.push(item)
			continue
		}

		flushList()
		blocks.push({ type: 'paragraph', text: line })
	}

	flushList()
	return blocks
}

export function DocumentContent({ content }: { content: string }) {
	const blocks = parse(content)

	return (
		<div className="space-y-5">
			{blocks.map((block, index) => {
				if (block.type === 'heading') {
					return (
						<h2
							key={index}
							className="pt-4 text-2xl font-bold text-(--color-app-text)"
						>
							{block.text}
						</h2>
					)
				}

				if (block.type === 'list') {
					return (
						<ul
							key={index}
							className="ml-5 list-disc space-y-2 marker:text-(--color-app-accent)"
						>
							{block.items.map((item, itemIndex) => (
								<li key={itemIndex}>{item}</li>
							))}
						</ul>
					)
				}

				return <p key={index}>{block.text}</p>
			})}
		</div>
	)
}
