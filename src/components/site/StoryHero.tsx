'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react'
import type { TimeScene } from './studio/TimeScene'
import s from './story.module.css'

const chapters = ['Time', 'Pause', 'Beauty', 'Craft', 'Your time']
const clamp = (v: number) => Math.max(0, Math.min(1, v))
const ease = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t) }

export function StoryHero() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<TimeScene | null>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = root.current, target = canvas.current
    if (!el || !target) return
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const panels = Array.from(el.querySelectorAll<HTMLElement>('[data-panel]'))
    let raf = 0, cancelled = false, current = -1
    const update = () => {
      raf = 0
      const reduced = media.matches
      el.dataset.motion = reduced ? 'still' : 'full'
      const stage = el.firstElementChild as HTMLElement
      const travel = Math.max(1, el.offsetHeight - stage.offsetHeight)
      const p = clamp((68 - el.getBoundingClientRect().top) / travel)
      const t = Math.max(0, Math.min(4, p * 4.8 - .15))
      const index = Math.round(t)
      if (current !== index) { current = index; setActive(index) }
      panels.forEach((panel, i) => {
        const distance = t - i
        const opacity = 1 - ease((Math.abs(distance) - .28) / .44)
        panel.style.setProperty('--alpha', String(opacity))
        panel.style.setProperty('--shift', `${-distance * 38}px`)
        panel.inert = !reduced && index !== i
        if (reduced) panel.removeAttribute('aria-hidden')
        else panel.setAttribute('aria-hidden', String(index !== i))
      })
      el.style.setProperty('--progress', String(p))
      el.style.setProperty('--time-scale', String(1 + ease(t / .9) * 2.2))
      el.style.setProperty('--time-alpha', String(1 - ease(t / .8)))
      el.style.setProperty('--pause-alpha', String(1 - ease((Math.abs(t - 1) - .2) / .6)))
      el.style.setProperty('--beauty-alpha', String(1 - ease((Math.abs(t - 2) - .25) / .65)))
      el.style.setProperty('--craft-alpha', String(1 - ease((Math.abs(t - 3) - .25) / .55)))
      el.style.setProperty('--photo-y', `${(1 - t) * 65}px`)
      el.style.setProperty('--detail-scale', String(1.02 + clamp(t - 2.5) * .18))
      el.style.setProperty('--happiness', String(ease((t - 1.85) / .35)))
      el.style.setProperty('--beauty', String(1 - ease((t - 1.85) / .35)))
      el.style.setProperty('--canvas-alpha', String(1 - ease((t - 2.55) / .5)))
      scene.current?.setProgress(t)
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update) }
    const preference = () => { scene.current?.setReduced(media.matches); schedule() }
    const lost = (event: Event) => { event.preventDefault(); setReady(false) }
    target.addEventListener('webglcontextlost', lost)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    media.addEventListener('change', preference)
    schedule()
    import('./studio/TimeScene').then(({ TimeScene }) => {
      if (cancelled) return
      scene.current = new TimeScene(target, media.matches)
      setReady(true)
      schedule()
    }).catch(() => { if (!cancelled) setReady(false) })
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      media.removeEventListener('change', preference)
      target.removeEventListener('webglcontextlost', lost)
      scene.current?.dispose()
      scene.current = null
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
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 68 + (el.offsetHeight - height) * ((index + .15) / 4.8), behavior: 'smooth' })
  }

  return <section id="top" ref={root} className={s.hero} aria-label="Your time for happiness — เรื่องราวของ Nail Time">
    <div className={s.stage}>
      <div className={s.topline}><span>NAIL TIME & SPA</span><span>A LITTLE TIME, JUST FOR YOU.</span><a href="#story">ข้ามเรื่องราว <ArrowUpRight size={12} /></a></div>
      <div className={s.visuals} aria-hidden="true">
        <div className={s.timeWord}>TIME</div>
        <div className={s.canvasWrap} style={{ visibility: ready ? 'visible' : 'hidden' }}><canvas ref={canvas} className={s.canvas} /></div>
        {!ready && <div className={s.fallbackRibbon} />}
        <div className={s.pausePhoto}><Image src="/images/hero.webp" alt="" fill sizes="(max-width:760px) 55vw, 25vw" /><span>A MOMENT OF YOUR OWN.</span></div>
        <div className={s.beautyPhoto}><Image src="/images/portfolio/1.webp" alt="" fill sizes="(max-width:760px) 45vw, 20vw" /><span>COLOR. FEELING. YOU.</span></div>
        <div className={s.craftPhoto}><Image src="/images/portfolio/3.webp" alt="" fill sizes="(max-width:760px) 100vw, 55vw" /></div>
        <div className={s.craftCaption}>THE ART IS IN THE DETAILS.<span>NAIL TIME — SELECTED WORK</span></div>
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
        {ready && <button className={s.motion} aria-label={paused ? 'เล่นการเคลื่อนไหว' : 'หยุดการเคลื่อนไหว'} onClick={() => { setPaused(!paused); scene.current?.setPaused(!paused) }}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>}
      </div>
      <div className={s.progress} />
    </div>
  </section>
}
