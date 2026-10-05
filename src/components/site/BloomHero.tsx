'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react'
import type { BloomScene } from './studio/BloomScene'
import s from './bloom.module.css'

export function BloomHero() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<BloomScene | null>(null)
  const [ready, setReady] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const element = root.current, target = canvas.current
    if (!element || !target) return
    let cancelled = false, raf = 0, progress = 0, last = 0
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = (now = performance.now()) => {
      raf = 0
      const rect = element.getBoundingClientRect()
      const stage = element.firstElementChild as HTMLElement
      const travel = Math.max(1, element.offsetHeight - stage.offsetHeight - 68)
      const desired = media.matches ? 0 : Math.max(0, Math.min(1, -rect.top / travel))
      const dt = last ? Math.min(64, now - last) : 16
      last = now
      progress += (desired - progress) * (1 - Math.exp(-dt / 150))
      if (Math.abs(desired - progress) < 0.001) progress = desired
      const p = progress
      element.style.setProperty('--inset', `${p * (innerWidth < 761 ? 4 : 7)}%`)
      element.style.setProperty('--bottom', `${p * (innerWidth < 761 ? 36 : 34)}%`)
      element.style.setProperty('--top', `${p * 3}%`)
      element.style.setProperty('--copy-opacity', `${1 - Math.min(1, p * 2.5)}`)
      element.style.setProperty('--copy-y', `${-p * 50}px`)
      element.style.setProperty('--scene-left', `${42 * (1 - p)}%`)
      element.style.setProperty('--scene-top', `${40 * (1 - p)}%`)
      element.style.setProperty('--brand-opacity', `${Math.min(1, Math.max(0, (p - 0.18) / 0.45))}`)
      element.style.setProperty('--brand-y', `${(1 - p) * 55}px`)
      scene.current?.setProgress(p)
      setRevealed(p > 0.55)
      if (p !== desired) raf = requestAnimationFrame(update)
    }
    const schedule = () => { if (!raf) { last = 0; raf = requestAnimationFrame(update) } }
    const preference = () => { setReduced(media.matches); scene.current?.setReduced(media.matches); schedule() }
    const lost = (event: Event) => { event.preventDefault(); setReady(false) }
    target.addEventListener('webglcontextlost', lost)
    media.addEventListener('change', preference)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    preference()
    import('./studio/BloomScene').then(({ BloomScene }) => {
      if (cancelled) return
      scene.current = new BloomScene(target, media.matches)
      scene.current.setProgress(progress)
      setReady(true)
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

  return <section ref={root} className={s.hero} id="top" aria-labelledby="bloom-title">
    <div className={s.stage}>
      <div className={s.frame}>
        <div className={s.topline}><span>NAIL ART, IN FULL BLOOM.</span><span>CHON BURI · THAILAND</span></div>
        <div className={s.copy} inert={revealed} aria-hidden={revealed}>
          <span className={s.eyebrow}>A LITTLE TIME. A BEAUTIFUL YOU.</span>
          <h1 id="bloom-title">Beauty,<br /><em>in bloom.</em></h1>
          <p>ให้ความเป็นคุณ ผลิบานที่ปลายนิ้ว<br /><span>ร้านทำเล็บสไตล์ญี่ปุ่น · ดอนหัวฬอ ชลบุรี</span></p>
          <Link href="/booking" className={s.book}>จองเวลาของคุณ <ArrowUpRight size={19} /></Link>
        </div>
        <div className={s.sculpture}>
          <div className={s.halo} aria-hidden="true" />
          <div className={s.fallback} style={{ opacity: ready ? 0 : 1 }} aria-hidden={ready}><Image src="/images/hero.webp" fill priority sizes="(max-width: 760px) 100vw, 70vw" alt="ชุดเล็บเจลโทนชมพู มุก และนู้ดของ Nail Time" /></div>
          <canvas ref={canvas} className={s.canvas} style={{ opacity: ready ? 1 : 0 }} role="img" aria-label="ประติมากรรมดอกไม้จากเล็บเจล 5 กลีบ สีชมพู ไวน์แดง และมุก คลี่เป็นชุดเล็บเมื่อเลื่อน" aria-hidden={!ready} />
          <span className={s.sceneCaption}>THE BLOOM COLLECTION <i /> N° 01</span>
        </div>
        {ready && !reduced && <button type="button" className={s.pause} aria-label={paused ? 'เล่นการเคลื่อนไหว 3D' : 'หยุดการเคลื่อนไหว 3D'} onClick={() => { setPaused(!paused); scene.current?.setPaused(!paused) }}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>}
        <a href="#story" className={s.scroll} inert={revealed} aria-hidden={revealed}><ArrowDown size={15} /> SCROLL TO BLOOM</a>
      </div>
      <div className={s.brand} aria-hidden={!revealed}>
        <div className={s.brandCaption}><span>SMALL DETAILS. BEAUTIFUL YOU.</span><a href="#studio" tabIndex={revealed ? 0 : -1}>ค้นพบสีของคุณ <ArrowUpRight size={16} /></a></div>
        <div className={s.wordmark}>NAILTIME<span>®</span></div>
        <div className={s.brandFoot}><span>NAIL ART & SELF-CARE STUDIO</span><span>ネイルタイム · SINCE 2019</span></div>
      </div>
    </div>
  </section>
}
