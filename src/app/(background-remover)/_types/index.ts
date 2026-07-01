import type { JobCapableResponse } from '@/hooks/use-processing-job'

export type BgRemoveApiResponse = JobCapableResponse
export type FlowState = 'idle' | 'processing' | 'ready'
export type WorkspaceStatus = 'processing' | 'ready'

export type BackgroundRemoverWorkspaceProps = {
	status: WorkspaceStatus
	sourceUrl: string
	resultUrl?: string
	backgroundColor?: string
	onBackgroundColorChange: (color?: string) => void
	onDownload: () => void
	onUploadAnother: () => void
}

export type EditorActionsProps = {
	disabled: boolean
	onDownload: () => void
}

export type BackgroundEditorToolsProps = {
	backgroundColor?: string
	disabled: boolean
	onBackgroundColorChange: (color?: string) => void
}

export type DemoSample = {
	key: 'people' | 'animals' | 'objects' | 'scene'
	labelKey:
		| 'tool.bg.demo.people'
		| 'tool.bg.demo.animals'
		| 'tool.bg.demo.objects'
		| 'tool.bg.demo.scene'
	src: string
	cutSrc: string
}
