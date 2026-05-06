'use client'
import { useRef, useEffect } from 'react'
import { useInView } from 'framer-motion'

type Props = { className?: string; color?: string; delay?: number }

export function DrawLine({ className, color = '#d8b192', delay = 0 }: Props) {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const drawn = useRef(false)

  useEffect(() => {
    if (!inView || drawn.current || !ref.current) return
    drawn.current = true
    const path = ref.current.querySelector('path')
    if (!path) return

    const len = path.getTotalLength()
    path.style.strokeDasharray = String(len)
    path.style.strokeDashoffset = String(len)

    const timer = setTimeout(() => {
      import('animejs').then((mod) => {
        const anime = ('default' in mod ? mod.default : mod) as (opts: object) => void
        anime({
          targets: path,
          strokeDashoffset: [len, 0],
          duration: 900,
          easing: 'easeOutCubic',
        })
      })
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [inView, delay])

  return (
    <svg ref={ref} className={className} viewBox="0 0 200 12" fill="none" aria-hidden>
      <path
        d="M2 8 C40 2, 80 11, 120 5 C155 0, 175 9, 198 6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
