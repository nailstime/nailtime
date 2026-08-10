'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/#services', label: 'บริการ' },
  { href: '/#story', label: 'เกี่ยวกับ' },
  { href: '/#products', label: 'ผลงาน' },
  { href: '/#contact', label: 'ติดต่อ' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-sand/15 shadow-[0_1px_12px_rgba(89,64,38,0.05)]">
      <div className="max-w-6xl mx-auto flex h-[68px] items-center gap-6 px-4 sm:px-6">
        <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="shrink-0 font-serif text-xl font-semibold tracking-tight text-site-dark">
          Nail Time <span className="font-light text-sand">&amp; Spa</span>
        </Link>

        <nav className="hidden md:flex gap-7 flex-1 ml-2">
          {navLinks.map(l => (
            <a key={l.href} href={l.href}
              className="text-[13px] font-medium tracking-wide text-site-gray hover:text-sand-dark transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <Link href="/booking/status"
          className="hidden md:inline-flex text-[13px] text-site-gray/60 hover:text-sand transition-colors shrink-0">
          ตรวจสอบคิวนัด
        </Link>

        <Link href="/booking"
          className="hidden md:inline-flex items-center rounded-full bg-sand text-white text-[11px] font-medium uppercase tracking-widest px-6 py-2.5 hover:bg-sand-dark transition-all hover:shadow-md active:scale-95">
          จองนัด
        </Link>

        <button className="ml-auto rounded-full p-2 text-site-dark transition-colors hover:bg-sand/10 md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="flex max-h-[calc(100svh-64px)] flex-col gap-4 overflow-y-auto border-t border-sand/20 bg-cream px-4 py-4 shadow-lg sm:px-6 md:hidden">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-sm font-medium uppercase tracking-widest text-site-gray">
              {l.label}
            </a>
          ))}
          <Link href="/booking/status" onClick={() => setOpen(false)}
            className="text-sm font-medium text-site-gray">
            ตรวจสอบคิวนัด
          </Link>
          <Link href="/booking" onClick={() => setOpen(false)}
            className="text-sm font-medium uppercase tracking-widest text-sand">
            จองนัด →
          </Link>
        </div>
      )}
    </header>
  )
}
