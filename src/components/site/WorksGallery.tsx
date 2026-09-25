'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { WORKS } from './data'

// Asymmetric editorial layout; columns drift at different speeds while scrolling.
const LAYOUT = [
  { col: 0, aspect: 'aspect-[4/5]' },
  { col: 1, aspect: 'aspect-square' },
  { col: 2, aspect: 'aspect-[3/4]' },
  { col: 0, aspect: 'aspect-square' },
  { col: 1, aspect: 'aspect-[4/5]' },
  { col: 2, aspect: 'aspect-[4/5]' },
]

export function WorksGallery() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const drift = [
    useTransform(scrollYProgress, [0, 1], [40, -40]),
    useTransform(scrollYProgress, [0, 1], [110, -60]),
    useTransform(scrollYProgress, [0, 1], [20, -90]),
  ]
  const [active, setActive] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (active !== null && !d.open) d.showModal()
    if (active === null && d.open) d.close()
  }, [active])

  const step = (dir: number) => setActive((i) => (i === null ? i : (i + dir + WORKS.length) % WORKS.length))

  return (
    <>
      <div ref={ref} className="relative grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {[0, 1, 2].map((col) => (
          <motion.div
            key={col}
            style={reduce ? undefined : { y: drift[col] }}
            className={`flex flex-col gap-3 md:gap-5 ${col === 2 ? 'col-span-2 grid grid-cols-2 md:col-span-1 md:flex' : ''}`}
          >
            {LAYOUT.map((l, i) =>
              l.col === col ? (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`group relative ${l.aspect} overflow-hidden rounded-2xl bg-[#efe6d8]`}
                  aria-label={`ดูผลงานชิ้นที่ ${i + 1} แบบเต็มจอ`}
                >
                  <Image
                    src={WORKS[i]}
                    alt={`ผลงานเล็บเจลชิ้นที่ ${i + 1} จากร้าน Nail Time`}
                    fill
                    sizes="(min-width: 768px) 30vw, 50vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                  />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] tabular-nums text-[var(--nt-ink)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    No.{String(i + 1).padStart(2, '0')}
                  </span>
                </button>
              ) : null,
            )}
          </motion.div>
        ))}
      </div>

      <dialog
        ref={dialog}
        onClose={() => setActive(null)}
        onClick={(e) => e.target === e.currentTarget && setActive(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
        className="m-auto max-h-[92svh] w-[min(92vw,720px)] overflow-visible bg-transparent p-0 backdrop:bg-[#1c150f]/85 backdrop:backdrop-blur-sm"
        aria-label="ผลงานแบบเต็มจอ"
      >
        {active !== null && (
          <div className="relative">
            <div className="relative aspect-[4/5] max-h-[80svh] w-full overflow-hidden rounded-2xl">
              <Image src={WORKS[active]} alt={`ผลงานเล็บเจลชิ้นที่ ${active + 1}`} fill sizes="720px" className="object-contain" />
            </div>
            <div className="mt-3 flex items-center justify-between text-white">
              <button type="button" onClick={() => step(-1)} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="ผลงานก่อนหน้า">
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm tabular-nums">{active + 1} / {WORKS.length}</span>
              <button type="button" onClick={() => step(1)} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="ผลงานถัดไป">
                <ChevronRight size={20} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute -top-14 right-0 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="ปิด"
              autoFocus
            >
              <X size={20} />
            </button>
          </div>
        )}
      </dialog>
    </>
  )
}
