import { createAdminClient } from '@/lib/supabase/server'
import { notifyReminder } from '@/lib/telegram'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  // Target time = Bangkok now + 15 min, floored to HH:MM:00
  const nowUtcMs = Date.now()
  const bangkokMs = nowUtcMs + 7 * 60 * 60 * 1000
  const target = new Date(bangkokMs + 15 * 60 * 1000)

  const targetDate = `${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, '0')}-${String(target.getUTCDate()).padStart(2, '0')}`
  const targetTime = `${String(target.getUTCHours()).padStart(2, '0')}:${String(target.getUTCMinutes()).padStart(2, '0')}:00`

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('bookings') as any)
    .select('guest_name, guest_phone, start_time, end_time, services(name)')
    .eq('slot_date', targetDate)
    .eq('start_time', targetTime)
    .in('status', ['pending', 'confirmed'])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data?.length) return NextResponse.json({ ok: true, sent: 0 })

  await Promise.all(
    data.map((b: { guest_name: string; guest_phone: string | null; start_time: string; end_time: string; services: { name: string } | null }) =>
      notifyReminder({
        guest_name: b.guest_name,
        guest_phone: b.guest_phone,
        service_name: b.services?.name ?? '',
        start_time: b.start_time,
        end_time: b.end_time,
      }).catch(() => {})
    )
  )

  return NextResponse.json({ ok: true, sent: data.length })
}
