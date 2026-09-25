'use client'
import { useState } from 'react'
import { ArrowUpRight, Clock } from 'lucide-react'
import styles from './site.module.css'

type Service = {
  id: string
  name: string
  description: string | null
  duration: number
  price: number | null
}

// Same contract as the original ServicesSection: HomeBookingBar listens for these events.
function book(serviceId: string) {
  window.dispatchEvent(new CustomEvent('select-service', { detail: { id: serviceId } }))
  document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function openAll() {
  window.dispatchEvent(new CustomEvent('open-services-panel'))
  document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

export function ServiceMenu({ services }: { services: Service[] }) {
  const [expanded, setExpanded] = useState(false)
  const LIMIT = 7
  const shown = expanded ? services : services.slice(0, LIMIT)

  if (services.length === 0) {
    return (
      <p className="py-8 text-[var(--nt-ink-2)]">
        กำลังอัปเดตเมนูบริการ สอบถามราคาได้ที่ <a className="underline" href="tel:0647451946">064 745 1946</a>
      </p>
    )
  }

  return (
    <div>
      <ol className="divide-y divide-[#2a2017]/10 border-y border-[#2a2017]/10">
        {shown.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => book(s.id)}
              className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-start gap-x-3 py-5 text-left transition-colors hover:bg-white/60 sm:grid-cols-[3rem_1fr_auto] sm:px-3"
              aria-label={`จอง ${s.name}${s.price !== null ? ` ราคา ${s.price.toLocaleString()} บาท` : ''} ใช้เวลา ${s.duration} นาที`}
            >
              <span className="pt-1 text-xs tabular-nums text-[var(--nt-accent)]">{String(i + 1).padStart(2, '0')}</span>
              <span className="min-w-0">
                <span className="flex items-baseline gap-3">
                  <span className="text-lg font-medium text-[var(--nt-ink)] sm:text-xl">{s.name}</span>
                  <span className={styles.dotLeader} aria-hidden="true" />
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--nt-ink-2)]">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={13} aria-hidden="true" /> {s.duration} นาที
                  </span>
                  {s.description && <span className="line-clamp-1">{s.description}</span>}
                </span>
              </span>
              <span className="flex items-center gap-3 pt-0.5">
                <span className="text-lg font-semibold tabular-nums text-[var(--nt-ink)] sm:text-xl">
                  {s.price !== null ? `฿${s.price.toLocaleString()}` : 'สอบถาม'}
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-[#2a2017]/15 transition-all duration-300 group-hover:border-[var(--nt-ink)] group-hover:bg-[var(--nt-ink)] group-hover:text-white">
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap gap-3">
        {services.length > LIMIT && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="min-h-11 rounded-full border border-[#2a2017]/20 px-5 text-sm text-[var(--nt-ink)] transition-colors hover:border-[var(--nt-ink)]"
          >
            {expanded ? 'ย่อเมนู' : `ดูบริการทั้งหมด (${services.length})`}
          </button>
        )}
        <button
          type="button"
          onClick={openAll}
          className="min-h-11 rounded-full px-5 text-sm text-[var(--nt-ink-2)] underline-offset-4 hover:text-[var(--nt-ink)] hover:underline"
        >
          เลือกหลายบริการพร้อมกัน →
        </button>
      </div>
    </div>
  )
}
