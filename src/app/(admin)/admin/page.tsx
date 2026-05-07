import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function StatCard({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href} className="bg-white rounded-2xl p-6 shadow-sm border border-sand/20 hover:border-sand hover:shadow-md transition-all">
      <p className="text-xs text-site-gray uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-bold text-site-dark mt-2">{value}</p>
    </Link>
  )
}

function MonthSlotCard({
  label, value, sub, accent,
}: {
  label: string; value: number; sub: string; accent: string
}) {
  return (
    <div className={`rounded-2xl p-5 border ${accent}`}>
      <p className="text-xs font-medium uppercase tracking-widest opacity-60">{label}</p>
      <p className="text-4xl font-bold mt-2">{value}</p>
      <p className="text-xs opacity-50 mt-1">{sub}</p>
    </div>
  )
}

function getBangkokNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date())
  const v = Object.fromEntries(parts.map(p => [p.type, p.value]))
  return {
    date: `${v.year}-${v.month}-${v.day}`,
    minutes: Number(v.hour) * 60 + Number(v.minute),
  }
}

function toMins(t: string) {
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-600',
  confirmed: 'bg-green-100 text-green-600',
  completed: 'bg-sand/20 text-sand-deep',
  cancelled: 'bg-red-100 text-red-500',
}
const STATUS_TH: Record<string, string> = {
  pending: 'รอยืนยัน', confirmed: 'ยืนยัน', completed: 'เสร็จ', cancelled: 'ยกเลิก',
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { date: today, minutes: nowMins } = getBangkokNow()

  const [year, month] = today.split('-').map(Number)
  const monthStr = String(month).padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate()
  const monthStart = `${year}-${monthStr}-01`
  const monthEnd = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`
  const monthName = new Date(today + 'T00:00:00').toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })

  const [
    { count: totalBookings },
    { count: todayBookings },
    { count: pendingBookings },
    { data: recentBookings },
    { data: monthSlots },
    { data: monthActiveBookings },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('slot_date', today),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings')
      .select('booking_no, status, created_at, slot_date, start_time, services(name), profiles(full_name), guest_name')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('time_slots')
      .select('id, slot_date, start_time')
      .gte('slot_date', monthStart)
      .lte('slot_date', monthEnd)
      .eq('is_active', true),
    supabase.from('bookings')
      .select('slot_date, start_time, end_time, status')
      .gte('slot_date', monthStart)
      .lte('slot_date', monthEnd)
      .in('status', ['pending', 'confirmed', 'completed']),
  ])

  type SlotRow = { id: string; slot_date: string; start_time: string }
  type BookingRow = { slot_date: string; start_time: string; end_time: string; status: string }

  const activeBookings = (monthActiveBookings ?? []) as unknown as BookingRow[]
  const slots = (monthSlots ?? []) as unknown as SlotRow[]

  // Build a set of "date_HH:MM:SS" keys for every 15-min slot covered by each booking
  const occupiedKeys = new Set<string>()
  const upcomingBookedKeys = new Set<string>()
  for (const b of activeBookings) {
    if (!b.slot_date || !b.start_time || !b.end_time) continue
    const start = toMins(b.start_time)
    const end = toMins(b.end_time)
    for (let t = start; t < end; t += 15) {
      const hh = String(Math.floor(t / 60)).padStart(2, '0')
      const mm = String(t % 60).padStart(2, '0')
      const key = `${b.slot_date}_${hh}:${mm}:00`
      occupiedKeys.add(key)
      if (b.status === 'pending' || b.status === 'confirmed') upcomingBookedKeys.add(key)
    }
  }

  let pastComplete = 0, pastEmpty = 0, futureBooked = 0, futureAvailable = 0
  for (const slot of slots) {
    const key = `${slot.slot_date}_${slot.start_time}`
    const isPast = slot.slot_date < today || (slot.slot_date === today && toMins(slot.start_time) < nowMins)
    if (isPast) {
      if (occupiedKeys.has(key)) { pastComplete++ } else { pastEmpty++ }
    } else {
      if (upcomingBookedKeys.has(key)) { futureBooked++ } else { futureAvailable++ }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-site-dark mb-8">ภาพรวม</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="การจองทั้งหมด" value={totalBookings ?? 0} href="/admin/bookings" />
        <StatCard label="วันนี้" value={todayBookings ?? 0} href="/admin/bookings" />
        <StatCard label="รอยืนยัน" value={pendingBookings ?? 0} href="/admin/bookings" />
      </div>

      <div className="mb-10">
        <h2 className="text-sm font-semibold text-site-gray uppercase tracking-widest mb-4">
          สรุป Slot — {monthName}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <MonthSlotCard
            label="งานสำเร็จ"
            value={pastComplete}
            sub="slot ที่มีการจองผ่านไปแล้ว"
            accent="bg-green-700 text-white border-green-700"
          />
          <MonthSlotCard
            label="Slot ว่างที่ผ่านไปแล้ว"
            value={pastEmpty}
            sub="ไม่มีการจอง / ยกเลิก"
            accent="bg-amber-50 text-amber-700 border-amber-200"
          />
          <MonthSlotCard
            label="Slot จองล่วงหน้า"
            value={futureBooked}
            sub="pending / confirmed"
            accent="bg-green-50 text-green-700 border-green-200"
          />
          <MonthSlotCard
            label="Slot ว่างที่ยังไม่ถึง"
            value={futureAvailable}
            sub="ยังไม่มีการจอง"
            accent="bg-stone-100 text-stone-500 border-stone-200"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sand/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-sand/10 flex justify-between items-center">
          <h2 className="font-semibold text-site-dark">การจองล่าสุด</h2>
          <Link href="/admin/bookings" className="text-xs text-sand hover:underline">ดูทั้งหมด</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/50">
              <tr>
                {['เลขที่', 'ลูกค้า', 'บริการ', 'วัน/เวลา', 'สถานะ'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-site-gray uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentBookings ?? []).map((b: { booking_no: string; status: string; slot_date: string | null; start_time: string | null; services: { name: string } | null; profiles: { full_name: string } | null; guest_name: string | null }) => (
                <tr key={b.booking_no} className="border-t border-sand/10 hover:bg-cream/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{b.booking_no}</td>
                  <td className="px-4 py-3">{b.profiles?.full_name ?? b.guest_name ?? '—'}</td>
                  <td className="px-4 py-3">{b.services?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-site-gray">
                    {b.slot_date} {b.start_time?.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[b.status]}`}>{STATUS_TH[b.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
