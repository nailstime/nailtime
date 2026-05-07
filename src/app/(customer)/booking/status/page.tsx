'use client'
import { useState } from 'react'
import Link from 'next/link'

type Booking = {
  booking_no: string
  status: string
  slot_date: string
  start_time: string
  end_time: string
  guest_name: string
  note: string | null
  services: { name: string } | null
}

const STATUS_LABEL: Record<string, string> = {
  pending:   'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}
const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-stone-100 text-stone-600',
  cancelled: 'bg-red-100 text-red-500',
}

function fmt(t: string) { return t.slice(0, 5) }

export default function BookingStatusPage() {
  const [query, setQuery] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setSearched(false)
    const res = await fetch(`/api/booking-lookup?q=${encodeURIComponent(q)}`)
    const data = res.ok ? await res.json() : []
    setBookings(Array.isArray(data) ? data : [])
    setSearched(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="text-xs text-site-gray hover:text-sand transition-colors mb-8 inline-block">
          ← กลับหน้าหลัก
        </Link>

        <h1 className="text-2xl font-bold text-site-dark mb-2">เช็คสถานะการจอง</h1>
        <p className="text-sm text-site-gray mb-8">
          กรอกเบอร์โทรศัพท์ หรือเลขที่การจอง (NT-XXXXXXXX-XXXX)
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="0812345678 หรือ NT-20260508-1234"
            className="flex-1 text-sm border border-sand/30 rounded-xl px-4 py-3 outline-none focus:border-sand bg-white"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-3 bg-sand text-white text-sm font-medium rounded-xl hover:bg-sand-deep transition-colors disabled:opacity-40"
          >
            {loading ? '...' : 'ค้นหา'}
          </button>
        </form>

        {searched && bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-site-gray text-sm">ไม่พบข้อมูลการจอง</p>
            <p className="text-site-gray/60 text-xs mt-1">กรุณาตรวจสอบเบอร์โทรหรือเลขที่การจองอีกครั้ง</p>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map(b => {
              const date = new Date(b.slot_date + 'T00:00:00').toLocaleDateString('th-TH', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })
              return (
                <div key={b.booking_no} className="bg-white rounded-2xl border border-sand/20 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-site-dark">{b.guest_name}</p>
                      <p className="text-xs font-mono text-site-gray/50 mt-0.5">{b.booking_no}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${STATUS_COLOR[b.status]}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-site-gray">
                    <p>💅 {b.services?.name}</p>
                    <p>📅 {date}</p>
                    <p>⏰ {fmt(b.start_time)} – {fmt(b.end_time)}</p>
                    {b.note && <p className="text-xs text-site-gray/60 italic">📝 {b.note}</p>}
                  </div>
                  {b.status === 'cancelled' && (
                    <p className="text-xs text-red-400 mt-3">
                      การจองนี้ถูกยกเลิกแล้ว หากมีข้อสงสัยกรุณาติดต่อร้าน
                    </p>
                  )}
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <p className="text-xs text-site-gray/50 mt-3">
                      หากต้องการยกเลิกกรุณาโทรแจ้งร้าน
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
