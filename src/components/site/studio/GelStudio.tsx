'use client'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Hand } from 'lucide-react'
import { FINISH_OPTIONS, SHADES } from '../data'
import type { Finish, NailScene } from './NailScene'
import styles from '../site.module.css'

type Shade = (typeof SHADES)[number]

/** WCAG relative luminance of a #rrggbb colour. */
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
// Pale polishes (Milk Beige, Sakura, Matcha, Blue Mist) wash out on lavender, so they get the plum backdrop.
const wantsDarkBackdrop = (hex: string) => luminance(hex) > 0.4

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
  const dark = wantsDarkBackdrop(shade.hex)

  useEffect(() => {
    let cancelled = false
    const canvas = canvasRef.current
    if (!canvas) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const chapter = document.getElementById('studio')
    let scrollFrame = 0
    const syncScroll = () => {
      cancelAnimationFrame(scrollFrame)
      scrollFrame = requestAnimationFrame(() => {
        if (!chapter || reducedMotion || window.innerWidth < 761) {
          sceneRef.current?.setScrollProgress(0)
          return
        }
        const rect = chapter.getBoundingClientRect()
        sceneRef.current?.setScrollProgress((68 - rect.top) / Math.max(1, rect.height - window.innerHeight))
      })
    }
    window.addEventListener('scroll', syncScroll, { passive: true })
    window.addEventListener('resize', syncScroll)
    const start = () =>
      import('./NailScene')
        .then(({ NailScene }) => {
          if (cancelled) return
          sceneRef.current = new NailScene(canvas, {
            color: initial.current.shade.hex,
            finish: initial.current.finish,
            reducedMotion,
            darkBackdrop: wantsDarkBackdrop(initial.current.shade.hex),
          })
          syncScroll()
          setStatus('ready')
        })
        .catch(() => !cancelled && setStatus('fallback'))
    // Let the LCP text and photo paint first.
    const hasIdle = typeof window.requestIdleCallback === 'function'
    const idle = hasIdle ? window.requestIdleCallback(start, { timeout: 1200 }) : setTimeout(start, 300)
    return () => {
      cancelled = true
      cancelAnimationFrame(scrollFrame)
      window.removeEventListener('scroll', syncScroll)
      window.removeEventListener('resize', syncScroll)
      if (hasIdle) window.cancelIdleCallback(idle as number)
      else clearTimeout(idle)
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [])

  const pickShade = (s: Shade) => {
    initial.current.shade = s
    setShade(s)
    sceneRef.current?.setColor(s.hex)
    sceneRef.current?.setDarkBackdrop(wantsDarkBackdrop(s.hex))
  }
  const pickFinish = (f: Finish) => {
    initial.current.finish = f
    setFinish(f)
    sceneRef.current?.setFinish(f)
  }
  const finishLabel = FINISH_OPTIONS.find((f) => f.id === finish)!
  const radioKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number, length: number, pick: (index: number) => void) => {
    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0
    if (!direction && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? length - 1 : (index + direction + length) % length
    pick(next)
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
  }

  return (
    <div className={`${styles.studio} relative flex h-full flex-col`}>
      <div className="relative mb-4 min-h-[260px] flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#e4dbe2_0%,#ccc0cb_100%)] sm:min-h-[300px]">
        {/* Gradients can't transition, so the plum backdrop fades in as its own layer. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#4a2c40_0%,#24141f_100%)] transition-opacity duration-[400ms] ease-out ${dark ? 'opacity-100' : 'opacity-0'}`}
        />
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
          aria-hidden={status !== 'ready'}
          style={{ cursor: 'grab' }}
          role="img"
          aria-label={`ตัวอย่างเล็บเจล 3 มิติ สี ${shade.th} แบบ${finishLabel.th}`}
        />
        {status === 'ready' && (
          <p className={`pointer-events-none absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] backdrop-blur-sm transition-colors duration-[400ms] ${dark ? 'bg-black/35 text-white/90' : 'bg-white/70 text-[var(--nt-ink-2)]'}`}>
            <Hand size={14} aria-hidden="true" /> ลากเพื่อหมุน<span className="hidden sm:inline"> · ชี้ที่เล็บเพื่อดูใกล้ๆ</span>
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 mx-auto w-full max-w-[560px] border border-[var(--nt-ink)]/15 bg-white/90 p-4 backdrop-blur-md sm:p-5">
        {status === 'fallback' && <p role="status" className="mb-3 text-xs text-[var(--nt-ink-2)]">อุปกรณ์นี้แสดงภาพตัวอย่างแทน 3D คุณยังเลือกดูชื่อสีได้</p>}
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--nt-accent)]">Gel Studio · ลองสีก่อนจอง</p>
          <p className="text-right text-sm text-[var(--nt-ink-2)]" aria-live="polite">
            <span className="font-semibold text-[var(--nt-ink)]">{shade.name}</span> · {finishLabel.th}
          </p>
        </div>

        <div role="radiogroup" aria-label="เลือกสีเล็บ" className="mt-3 flex flex-wrap gap-x-1 gap-y-1 sm:justify-between">
          {SHADES.map((s, index) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={shade.id === s.id}
              tabIndex={shade.id === s.id ? 0 : -1}
              onKeyDown={(event) => radioKeys(event, index, SHADES.length, (next) => pickShade(SHADES[next]))}
              aria-label={`${s.name} (${s.th})`}
              title={s.th}
              onClick={() => pickShade(s)}
              className={`${styles.swatchButton} grid h-11 w-11 place-items-center rounded-full`}
            >
              <span className={`${styles.swatch} ${shade.id === s.id ? styles.swatchOn : ''}`} style={{ background: s.hex }} />
            </button>
          ))}
        </div>

        <div role="radiogroup" aria-label="เลือกผิวสัมผัส" className="mt-3 grid grid-cols-4 gap-1 rounded-full bg-[var(--nt-paper)] p-1">
          {FINISH_OPTIONS.map((f, index) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={finish === f.id}
              tabIndex={finish === f.id ? 0 : -1}
              onKeyDown={(event) => radioKeys(event, index, FINISH_OPTIONS.length, (next) => pickFinish(FINISH_OPTIONS[next].id))}
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
            className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--nt-accent)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#7d4253]"
          >
            เลือกวันจองคิว
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
