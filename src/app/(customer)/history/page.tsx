import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function formatDateThai(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(t: string) { return t.slice(0, 5) }

const STATUS_LABEL: Record<string, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-600',
  confirmed: 'bg-green-100 text-green-600',
  completed: 'bg-sand/20 text-sand-deep',
  cancelled: 'bg-red-100 text-red-500',
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/history')

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`*, services(name), time_slots(slot_date, start_time, end_time)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-sand/20 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-site-dark">
            Nail Time <span className="text-sand">&amp; Spa</span>
          </Link>
          <Link href="/booking" className="text-xs text-sand font-semibold border border-sand rounded-full px-4 py-1.5 hover:bg-sand hover:text-white transition-colors">
            จองนัด
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-site-dark mb-6">ประวัติการจอง</h1>

        {!bookings || bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-site-gray text-sm mb-4">ยังไม่มีประวัติการจอง</p>
            <Link href="/booking" className="inline-block rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase px-8 py-3 hover:bg-sand-dark transition-all">
              จองนัดเลย
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b: any) => (
              <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-sand/20">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-site-dark">{b.services?.name}</p>
                    <p className="text-xs text-site-gray mt-0.5">#{b.booking_no}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLOR[b.status]}`}>
                    {STATUS_LABEL[b.status]}
                  </span>
                </div>
                <div className="border-t border-sand/10 pt-3 text-sm text-site-gray space-y-1">
                  <p>📅 {formatDateThai(b.time_slots?.slot_date)}</p>
                  <p>🕐 {formatTime(b.time_slots?.start_time)} – {formatTime(b.time_slots?.end_time)} น.</p>
                  {b.note && <p>📝 {b.note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
