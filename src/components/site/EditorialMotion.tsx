'use client'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import s from './editorial.module.css'

export function EditorialMotion({ children, className, amount = 50 }: { children: React.ReactNode; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount])
  return <motion.div ref={ref} className={className} style={{ position: 'absolute', ...(reduce ? {} : { y }) }}>{children}</motion.div>
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return <motion.div aria-hidden="true" className={s.progress} style={{ scaleX: scrollYProgress }} />
}
