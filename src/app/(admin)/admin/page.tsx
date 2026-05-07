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

export default async function AdminDashboard() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const [
    { count: totalBookings },
    { count: todayBookings },
    { count: pendingBookings },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true })
      .gte('created_at', today + 'T00:00:00')
      .lt('created_at', today + 'T23:59:59'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings')
      .select(`booking_no, status, created_at, slot_date, start_time, services(name), time_slots(slot_date, start_time), profiles(full_name), guest_name`)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-600',
    confirmed: 'bg-green-100 text-green-600',
    completed: 'bg-sand/20 text-sand-deep',
    cancelled: 'bg-red-100 text-red-500',
  }
  const STATUS_TH: Record<string, string> = {
    pending: 'รอยืนยัน', confirmed: 'ยืนยัน', completed: 'เสร็จ', cancelled: 'ยกเลิก'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-site-dark mb-8">ภาพรวม</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="การจองทั้งหมด" value={totalBookings ?? 0} href="/admin/bookings" />
        <StatCard label="วันนี้" value={todayBookings ?? 0} href="/admin/bookings" />
        <StatCard label="รอยืนยัน" value={pendingBookings ?? 0} href="/admin/bookings?status=pending" />
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
              {(recentBookings ?? []).map((b: any) => (
                <tr key={b.booking_no} className="border-t border-sand/10 hover:bg-cream/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{b.booking_no}</td>
                  <td className="px-4 py-3">{b.profiles?.full_name ?? b.guest_name ?? '—'}</td>
                  <td className="px-4 py-3">{b.services?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-site-gray">
                    {b.slot_date ?? b.time_slots?.slot_date} {(b.start_time ?? b.time_slots?.start_time)?.slice(0, 5)}
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
