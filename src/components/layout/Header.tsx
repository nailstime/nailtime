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
    <header className="sticky top-0 z-50 bg-cream/93 backdrop-blur-md border-b border-sand/20">
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-10 h-17">
        <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-bold text-xl tracking-tight text-site-dark shrink-0">
          Nail Time <span className="text-sand">&amp; Spa</span>
        </Link>

        <nav className="hidden md:flex gap-8 flex-1">
          {navLinks.map(l => (
            <a key={l.href} href={l.href}
              className="text-xs font-medium uppercase tracking-widest text-site-gray hover:text-sand transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <Link href="/booking"
          className="hidden md:inline-flex items-center rounded-full border border-site-dark text-xs font-medium uppercase tracking-widest px-6 py-2.5 hover:bg-site-dark hover:text-white transition-all">
          จองนัด
        </Link>

        <button className="md:hidden ml-auto" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-cream border-t border-sand/20 px-6 py-4 flex flex-col gap-4">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-sm font-medium uppercase tracking-widest text-site-gray">
              {l.label}
            </a>
          ))}
          <Link href="/booking" onClick={() => setOpen(false)}
            className="text-sm font-medium uppercase tracking-widest text-sand">
            จองนัด →
          </Link>
        </div>
      )}
    </header>
  )
}
