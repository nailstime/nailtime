import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''
  if (!q) return NextResponse.json([])

  let supabase: ReturnType<typeof createAdminClient>
  try {
    supabase = createAdminClient()
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date())

  // Exact match on booking_no OR guest_phone — must be precise, not a filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('bookings') as any)
    .select('booking_no, status, slot_date, start_time, end_time, guest_name, note, services(name)')
    .or(`booking_no.eq.${q},guest_phone.eq.${q}`)
    .gte('slot_date', today)
    .order('slot_date', { ascending: true })
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
