'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Hand } from 'lucide-react'
import { FINISH_OPTIONS, SHADES } from '../data'
import type { Finish, NailScene } from './NailScene'
import styles from '../site.module.css'

type Shade = (typeof SHADES)[number]

/**
 * The try-on studio. The 3D scene (and three.js) loads only after the page is
 * interactive; until then, or if WebGL is unavailable, the salon's own product
 * photo stands in.
 */
export function GelStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<NailScene | null>(null)
  const [shade, setShade] = useState<Shade>(SHADES[2])
  const [finish, setFinish] = useState<Finish>('gloss')
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')
  const initial = useRef({ shade, finish })

  useEffect(() => {
    let cancelled = false
    const canvas = canvasRef.current
    if (!canvas) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = () =>
      import('./NailScene')
        .then(({ NailScene }) => {
          if (cancelled) return
          sceneRef.current = new NailScene(canvas, {
            color: initial.current.shade.hex,
            finish: initial.current.finish,
            reducedMotion,
          })
          setStatus('ready')
        })
        .catch(() => !cancelled && setStatus('fallback'))
    // Let the LCP text and photo paint first.
    const hasIdle = typeof window.requestIdleCallback === 'function'
    const idle = hasIdle ? window.requestIdleCallback(start, { timeout: 1200 }) : setTimeout(start, 300)
    return () => {
      cancelled = true
      if (hasIdle) window.cancelIdleCallback(idle as number)
      else clearTimeout(idle)
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [])

  const pickShade = (s: Shade) => {
    setShade(s)
    sceneRef.current?.setColor(s.hex)
  }
  const pickFinish = (f: Finish) => {
    setFinish(f)
    sceneRef.current?.setFinish(f)
  }
  const finishLabel = FINISH_OPTIONS.find((f) => f.id === finish)!

  return (
    <div className="relative flex h-full flex-col">
      <div className="relative min-h-[340px] flex-1 sm:min-h-[420px]">
        {/* Photo stand-in: visible while loading and as the no-WebGL fallback. */}
        <div
          className={`absolute inset-0 overflow-hidden rounded-[28px] transition-opacity duration-700 ${status === 'ready' ? 'opacity-0' : 'opacity-100'}`}
          aria-hidden={status === 'ready'}
        >
          <Image
            src="/images/hero.webp"
            alt="เล็บเจลโทนนู้ดบนจานเซรามิก"
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover object-[78%_50%]"
          />
        </div>
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full touch-pan-y transition-opacity duration-1000 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
          style={{ cursor: 'grab' }}
          role="img"
          aria-label={`ตัวอย่างเล็บเจล 3 มิติ สี ${shade.th} แบบ${finishLabel.th}`}
        />
        {status === 'ready' && (
          <p className="pointer-events-none absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white/70 px-3 py-1.5 text-[12px] text-[var(--nt-ink-2)] backdrop-blur-sm">
            <Hand size={14} aria-hidden="true" /> ลากเพื่อหมุน<span className="hidden sm:inline"> · ชี้ที่เล็บเพื่อดูใกล้ๆ</span>
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 mx-auto -mt-6 w-full max-w-[560px] rounded-3xl border border-[#2a2017]/10 bg-white/85 p-4 shadow-[0_20px_50px_-24px_rgba(42,32,23,0.35)] backdrop-blur-md sm:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--nt-accent)]">Gel Studio · ลองสีก่อนจอง</p>
          <p className="text-right text-sm text-[var(--nt-ink-2)]" aria-live="polite">
            <span className="font-semibold text-[var(--nt-ink)]">{shade.name}</span> · {finishLabel.th}
          </p>
        </div>

        <div role="radiogroup" aria-label="เลือกสีเล็บ" className="mt-3 flex flex-wrap gap-x-1 gap-y-1 sm:justify-between">
          {SHADES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={shade.id === s.id}
              aria-label={`${s.name} (${s.th})`}
              title={s.th}
              onClick={() => pickShade(s)}
              className={`${styles.swatchButton} grid h-11 w-11 place-items-center rounded-full`}
            >
              <span className={`${styles.swatch} ${shade.id === s.id ? styles.swatchOn : ''}`} style={{ background: s.hex }} />
            </button>
          ))}
        </div>

        <div role="radiogroup" aria-label="เลือกผิวสัมผัส" className="mt-3 grid grid-cols-4 gap-1 rounded-full bg-[#f3ebe0] p-1">
          {FINISH_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={finish === f.id}
              onClick={() => pickFinish(f.id)}
              className={`min-h-10 rounded-full px-2 text-[13px] transition-colors duration-200 ${finish === f.id ? 'bg-[var(--nt-ink)] text-white' : 'text-[var(--nt-ink-2)] hover:bg-white/70'}`}
            >
              {f.th}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-[var(--nt-ink-2)]">
            สีบนจอเป็นโทนตัวอย่าง ช่างผสมให้ตรงโทนได้ที่ร้าน
            <br className="hidden sm:block" /> แจ้งชื่อสี <strong className="text-[var(--nt-ink)]">{shade.name}</strong> ตอนมาทำได้เลย
          </p>
          <Link
            href="/booking"
            className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--nt-sand)] px-5 text-sm font-semibold text-[var(--nt-ink)] transition-colors hover:bg-[#caa07f]"
          >
            จองคิวลายนี้
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
