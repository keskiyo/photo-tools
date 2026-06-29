'use client'

import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

type AnimatedCardProps = {
	children: ReactNode
	delay?: number
} & Omit<HTMLMotionProps<'div'>, 'children'>

export function AnimatedCard({
	children,
	delay = 0,
	...props
}: AnimatedCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-40px', amount: 0.2 }}
			transition={{ duration: 0.5, ease: 'easeOut', delay }}
			{...props}
		>
			{children}
		</motion.div>
	)
}
