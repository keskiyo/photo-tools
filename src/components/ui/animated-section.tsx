'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

type AnimatedSectionProps = {
	children: ReactNode
	delay?: number
	amount?: number
} & Omit<HTMLMotionProps<'section'>, 'children'>

export function AnimatedSection({
	children,
	delay = 0,
	amount = 0.18,
	...props
}: AnimatedSectionProps) {
	const shouldReduceMotion = useReducedMotion()

	return (
		<motion.section
			initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
			whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-50px', amount }}
			transition={
				shouldReduceMotion
					? { duration: 0 }
					: { duration: 0.6, ease: 'easeOut', delay }
			}
			{...props}
		>
			{children}
		</motion.section>
	)
}
