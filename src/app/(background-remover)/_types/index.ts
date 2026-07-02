import type { ReactNode } from 'react'

import type { JobCapableResponse } from '@/lib/job-client'

export type BgRemoveApiResponse = JobCapableResponse
export type FlowState = 'idle' | 'processing' | 'ready'
export type WorkspaceStatus = 'processing' | 'ready'
export type DownloadFormat = 'png' | 'webp' | 'jpg'

export type BackgroundRemoverWorkspaceProps = {
	status: WorkspaceStatus
	sourceUrl: string
	resultUrl?: string
	backgroundColor?: string
	onBackgroundColorChange: (color?: string) => void
	onDownload: (format: DownloadFormat) => void
	onUploadAnother: () => void
}

export type EditorActionsProps = {
	disabled: boolean
	onDownload: (format: DownloadFormat) => void
}

export type BackgroundEditorToolsProps = {
	backgroundColor?: string
	disabled: boolean
	onBackgroundColorChange: (color?: string) => void
}

export type ToolButtonProps = {
	ariaExpanded?: boolean
	children: string
	disabled: boolean
	icon: ReactNode
	isActive?: boolean
	onClick?: () => void
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
