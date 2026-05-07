import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null; error: unknown }
  if (data?.role !== 'admin') return null
  return supabase
}

export async function GET(request: Request) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date())

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('bookings')
    .select('*, services(name, duration), profiles(full_name, phone)')
    .in('status', ['pending', 'confirmed'])
    .gte('slot_date', today)
    .or(`booking_no.ilike.%${q}%,guest_phone.ilike.%${q}%`)
    .order('slot_date')
    .order('start_time')
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { slot_id, service_id, guest_name, guest_phone, note, status = 'confirmed' } = await request.json()
  if (!slot_id || !service_id || !guest_name?.trim()) {
    return NextResponse.json({ error: 'slot_id, service_id, guest_name required' }, { status: 400 })
  }
  if (!['pending', 'confirmed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const [{ data: slot, error: slotErr }, { data: service, error: svcErr }] = await Promise.all([
    db.from('time_slots').select('slot_date, start_time').eq('id', slot_id).single(),
    db.from('services').select('duration').eq('id', service_id).single(),
  ])
  if (slotErr || !slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
  if (svcErr || !service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  const [h, m] = slot.start_time.slice(0, 5).split(':').map(Number)
  const endMins = h * 60 + m + service.duration
  const end_time = `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}:00`

  const { data, error } = await db
    .from('bookings')
    .insert({
      slot_id,
      service_id,
      slot_date: slot.slot_date,
      start_time: slot.start_time,
      end_time,
      guest_name: guest_name.trim(),
      guest_phone: guest_phone?.trim() || null,
      note: note?.trim() || null,
      status,
    })
    .select('id, booking_no, status, slot_id, slot_date, start_time, end_time, guest_name, guest_phone, note, services(name, duration)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status, end_time } = await request.json()
  const valid = ['pending', 'confirmed', 'completed', 'cancelled']
  if (!id || !valid.includes(status)) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const update: Record<string, string> = { status }
  if (status === 'completed' && end_time) update.end_time = end_time

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('bookings') as any).update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
