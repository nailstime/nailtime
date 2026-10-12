'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import s from './story.module.css'

const chapters = ['Time', 'Pause', 'Beauty', 'Craft', 'Your time']
const FRAME_COUNT = 193
const frameSrc = (dir: string, i: number) => `/hero/${dir}/${String(i + 1).padStart(4, '0')}.webp`
// Share of each chapter's scroll where the copy holds still, and the padding before
// the first chapter so it holds as long as the middle ones. The last chapter gets a
// longer tail so the booking buttons linger before the next section scrolls in.
const HOLD = .75
const LEAD = HOLD / 2
const TAIL = .8
const SPAN = 4 + LEAD + TAIL
// How much of the video keeps playing while copy holds (the rest plays in the transitions).
const DRIFT = .3
const clamp = (v: number) => Math.max(0, Math.min(1, v))
const ease = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t) }

export function StoryHero() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = root.current, target = canvas.current
    const ctx = target?.getContext('2d')
    if (!el || !target || !ctx) return
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const panels = Array.from(el.querySelectorAll<HTMLElement>('[data-panel]'))
    const dir = innerWidth < 760 ? 'mobile' : 'desktop'
    const frames: HTMLImageElement[] = []
    const loaded: boolean[] = []
    let raf = 0, current = -1, frame = 0, drawn = -1

    const draw = () => {
      // Fall back to the nearest earlier frame that has finished loading.
      if (!target.width || !target.height) return
      let i = frame
      while (i > 0 && !loaded[i]) i--
      if (!loaded[i] || i === drawn) return
      drawn = i
      const img = frames[i], w = target.width, h = target.height
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
      target.dataset.ready = ''
    }
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2)
      target.width = Math.round(target.clientWidth * dpr)
      target.height = Math.round(target.clientHeight * dpr)
      drawn = -1
    }
    const update = () => {
      raf = 0
      const reduced = media.matches
      el.dataset.motion = reduced ? 'still' : 'full'
      const stage = el.firstElementChild as HTMLElement
      const travel = Math.max(1, el.offsetHeight - stage.offsetHeight)
      const p = clamp((68 - el.getBoundingClientRect().top) / travel)
      // `raw` moves steadily; `t` parks on each chapter for most of its scroll distance so
      // the copy stays readable. The video mostly follows `t` too, so the busy pour/hand
      // shots in chapters 3–5 don't keep racing past while the text is on screen.
      const raw = Math.max(0, Math.min(4, p * SPAN - LEAD))
      const seg = Math.min(3, Math.floor(raw))
      const t = seg + ease((raw - seg - HOLD / 2) / (1 - HOLD))
      const index = Math.round(t)
      if (current !== index) { current = index; setActive(index) }
      panels.forEach((panel, i) => {
        const distance = t - i
        // Fully gone by the midpoint between chapters so two headlines never overlap.
        const opacity = 1 - ease((Math.abs(distance) - .18) / .3)
        panel.style.setProperty('--alpha', String(opacity))
        panel.style.setProperty('--shift', `${-distance * 38}px`)
        panel.inert = !reduced && index !== i
        if (reduced) panel.removeAttribute('aria-hidden')
        else panel.setAttribute('aria-hidden', String(index !== i))
      })
      el.style.setProperty('--progress', String(p))
      el.style.setProperty('--happiness', String(ease((raw - 1.9) / .25)))
      el.style.setProperty('--beauty', String(1 - ease((raw - 1.9) / .25)))
      frame = Math.round(((DRIFT * raw + (1 - DRIFT) * t) / 4) * (FRAME_COUNT - 1))
      if (!reduced) draw()
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update) }
    // The canvas is display:none until motion mode is decided, so size it whenever its box changes.
    const observer = new ResizeObserver(() => { size(); draw() })
    observer.observe(target)

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => { loaded[i] = true; if (Math.abs(i - frame) < 3 || i === 0) { drawn = -1; draw() } }
      img.src = frameSrc(dir, i)
      frames.push(img)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    media.addEventListener('change', schedule)
    schedule()
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      media.removeEventListener('change', schedule)
      frames.forEach(img => { img.onload = null })
    }
  }, [])

  const goTo = (index: number) => {
    const el = root.current
    if (!el) return
    if (el.dataset.motion !== 'full') {
      el.querySelectorAll('[data-panel]')[index]?.scrollIntoView({ behavior: 'auto' })
      return
    }
    const height = (el.firstElementChild as HTMLElement).offsetHeight
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 68 + (el.offsetHeight - height) * ((index + LEAD) / SPAN), behavior: 'smooth' })
  }

  return <section id="top" ref={root} className={s.hero} aria-label="Your time for happiness — เรื่องราวของ Nail Time">
    <div className={s.stage}>
      <div className={s.topline}><span>NAIL TIME & SPA</span><span>A LITTLE TIME, JUST FOR YOU.</span><a href="#story">ข้ามเรื่องราว <ArrowUpRight size={12} /></a></div>
      <div className={s.visuals} aria-hidden="true">
        <canvas ref={canvas} className={s.canvas} />
        <div className={s.shade} />
      </div>

      <article data-panel className={`${s.panel} ${s.time}`}>
        <span className={s.kicker}>01 / TIME</span>
        <h1>Because your<br /><em>time matters.</em></h1>
        <p>ในวันที่ทุกอย่างหมุนเร็วขึ้น<br />บางครั้งสิ่งที่เราต้องการที่สุด<br />คือเวลาเล็ก ๆ ให้กับตัวเอง</p>
        <button className={s.begin} onClick={() => goTo(1)}><ArrowDown size={15} /> TAKE A LITTLE TIME</button>
      </article>
      <article data-panel className={`${s.panel} ${s.pause}`}>
        <span className={s.kicker}>02 / PAUSE</span>
        <h2>A moment<br /><em>to pause.</em></h2>
        <p>วางทุกอย่างไว้ข้างนอก<br />แล้วให้เวลานี้เป็นของคุณ</p>
        <span className={s.whisper}>BREATHE IN. &nbsp; SLOW DOWN.</span>
      </article>
      <article data-panel className={`${s.panel} ${s.beauty}`}>
        <span className={s.kicker}>03 / BEAUTY</span>
        <h2><span className={s.morph}><span>Beauty</span><em>Happiness</em></span><span className={s.subtitle}>is more than what you see.</span></h2>
        <p>ความสวยไม่ใช่แค่สีบนปลายเล็บ<br />แต่คือความรู้สึกดีที่คุณพากลับไปด้วย</p>
      </article>
      <article data-panel className={`${s.panel} ${s.craft}`}>
        <span className={s.kicker}>04 / CRAFT</span>
        <h2>Made<br /><em>with care.</em></h2>
        <p>สีเจลพรีเมียม<br />เทคนิคที่ประณีต<br />และความใส่ใจในทุกรายละเอียด</p>
        <span className={s.whisper}>EVERY CURVE. EVERY COLOR. EVERY YOU.</span>
      </article>
      <article data-panel className={`${s.panel} ${s.payoff}`}>
        <span className={s.flower} aria-hidden="true">✳</span>
        <span className={s.kicker}>05 / THIS IS YOUR TIME.</span>
        <h2>Your time<br /><em>for happiness.</em></h2>
        <div className={s.brand}>NAIL TIME <span>& SPA</span></div>
        <div className={s.actions}><Link href="/booking">Book Your Time <ArrowUpRight size={17} /></Link><a href="#menu">Explore Our Services <ArrowUpRight size={17} /></a></div>
      </article>

      <div className={s.bottomline}>
        <span className={s.scrollHint}>SCROLL TO FEEL <ArrowDown size={12} /></span>
        <nav aria-label="ฉากในเรื่องราว" className={s.chapters}>{chapters.map((label, i) => <button key={label} onClick={() => goTo(i)} aria-current={active === i ? 'step' : undefined} aria-label={`ฉาก ${i + 1}: ${label}`}><span>0{i + 1}</span><span>{label}</span></button>)}</nav>
      </div>
      <div className={s.progress} />
    </div>
  </section>
}
