'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import styles from './site.module.css'
import { SHOP } from './data'

const LINKS = [
  ['#services', 'บริการ'],
  ['#works', 'ผลงาน'],
  ['#menu', 'ราคา'],
  ['#reviews', 'รีวิว'],
  ['#visit', 'ติดต่อ'],
] as const

// Homepage-only header. The shared <Header> used by booking/admin is left untouched.
export function SiteNav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${solid || open ? 'bg-[#fcf8ef]/90 shadow-[0_1px_0_rgba(42,32,23,0.08)] backdrop-blur-md' : 'bg-transparent'}`}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-3" aria-label="Nail Time & Spa หน้าแรก">
          <span className={`${styles.display} text-xl italic tracking-tight text-[var(--nt-ink)]`}>Nail Time</span>
          <span className={`${styles.jp} hidden text-xs tracking-[0.3em] text-[var(--nt-accent)] sm:inline`}>ネイルタイム</span>
        </Link>

        <nav aria-label="เมนูหลัก" className="hidden items-center gap-7 text-[15px] text-[var(--nt-ink-2)] md:flex">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="relative flex min-h-11 items-center transition-colors hover:text-[var(--nt-ink)] after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={SHOP.tel} className="hidden min-h-11 items-center px-2 text-sm text-[var(--nt-ink-2)] hover:text-[var(--nt-ink)] lg:flex">
            {SHOP.phone}
          </a>
          <Link
            href="/booking"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--nt-ink)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#4a3a2a]"
          >
            จองคิว
          </Link>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full md:hidden"
            aria-expanded={open}
            aria-controls="nt-menu"
            aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="nt-menu" aria-label="เมนูมือถือ" className="h-[calc(100svh-68px)] overflow-y-auto border-t border-[#2a2017]/10 bg-[#fcf8ef] px-5 pb-10 pt-4 md:hidden">
          {LINKS.map(([href, label], i) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex min-h-16 items-baseline gap-4 border-b border-[#2a2017]/10 text-3xl text-[var(--nt-ink)]"
            >
              <span className="text-xs text-[var(--nt-accent)]">0{i + 1}</span>
              {label}
            </a>
          ))}
          <div className="mt-8 flex flex-col gap-2 text-sm text-[var(--nt-ink-2)]">
            <a href={SHOP.tel} className="min-h-11 py-2">โทร {SHOP.phone}</a>
            <span>เปิดทุกวัน {SHOP.hours} น.</span>
          </div>
        </nav>
      )}
    </header>
  )
}
