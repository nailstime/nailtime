'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รอยืนยัน' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'completed', label: 'เสร็จสิ้น' },
  { value: 'cancelled', label: 'ยกเลิก' },
]

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-600',
  confirmed: 'bg-green-100 text-green-600',
  completed: 'bg-sand/20 text-sand-deep',
  cancelled: 'bg-red-100 text-red-500',
}

function formatTime(t: string) { return t?.slice(0, 5) ?? '' }

type Booking = any

export default function BookingsClient({
  bookings, total, page, limit, currentStatus
}: {
  bookings: Booking[]; total: number; page: number; limit: number; currentStatus: string
}) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  const totalPages = Math.ceil(total / limit)

  async function updateStatus(bookingId: string, status: string) {
    setUpdating(bookingId)
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bookingId, status }),
    })
    setUpdating(null)
    router.refresh()
  }

  function setFilter(status: string) {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    router.push(`/admin/bookings?${params.toString()}`)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-site-dark mb-6">การจอง ({total})</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)}
            className={`text-xs px-4 py-1.5 rounded-full font-medium transition-colors
              ${currentStatus === s.value ? 'bg-sand text-white' : 'bg-white text-site-gray border border-sand/20 hover:border-sand'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sand/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/50">
              <tr>
                {['เลขที่', 'ลูกค้า', 'เบอร์', 'บริการ', 'วันที่', 'เวลา', 'สถานะ', 'จัดการ'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-site-gray uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: Booking) => {
                const name = b.profiles?.full_name ?? b.guest_name ?? '—'
                const phone = b.profiles?.phone ?? b.guest_phone ?? '—'
                return (
                  <tr key={b.id} className="border-t border-sand/10 hover:bg-cream/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-site-gray">{b.booking_no}</td>
                    <td className="px-4 py-3 font-medium">{name}</td>
                    <td className="px-4 py-3 text-site-gray text-xs">{phone}</td>
                    <td className="px-4 py-3">{b.services?.name}</td>
                    <td className="px-4 py-3 text-xs text-site-gray whitespace-nowrap">{b.time_slots?.slot_date}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {formatTime(b.time_slots?.start_time)}–{formatTime(b.time_slots?.end_time)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue={b.status}
                        disabled={updating === b.id}
                        onChange={e => updateStatus(b.id, e.target.value)}
                        className="text-xs border border-sand/30 rounded-lg px-2 py-1 outline-none focus:border-sand bg-white disabled:opacity-50">
                        <option value="pending">รอยืนยัน</option>
                        <option value="confirmed">ยืนยัน</option>
                        <option value="completed">เสร็จสิ้น</option>
                        <option value="cancelled">ยกเลิก</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => router.push(`/admin/bookings?page=${i + 1}${currentStatus ? `&status=${currentStatus}` : ''}`)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                ${page === i + 1 ? 'bg-sand text-white' : 'bg-white text-site-gray border border-sand/20 hover:border-sand'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
