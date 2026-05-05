import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { service_id, slot_id, guest_name, guest_phone, note } = body

  if (!service_id || !slot_id) {
    return NextResponse.json({ error: 'service_id and slot_id are required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: slot, error: slotErr } = await supabase
    .from('slot_availability')
    .select('available')
    .eq('id', slot_id)
    .single() as { data: { available: number } | null; error: unknown }

  if (slotErr || !slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
  if (slot.available <= 0) return NextResponse.json({ error: 'Slot is fully booked' }, { status: 409 })

  const { data: { user } } = await supabase.auth.getUser()

  const insertPayload: Record<string, unknown> = {
    service_id,
    slot_id,
    note: note || null,
    status: 'pending',
  }

  if (user) {
    insertPayload.user_id = user.id
  } else {
    if (!guest_name || !guest_phone) {
      return NextResponse.json({ error: 'Name and phone are required for guest booking' }, { status: 400 })
    }
    insertPayload.guest_name = guest_name
    insertPayload.guest_phone = guest_phone
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('bookings') as any)
    .insert(insertPayload)
    .select('booking_no')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ booking_no: data.booking_no }, { status: 201 })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20
  const from = (page - 1) * limit

  const { data, error } = await supabase
    .from('bookings')
    .select(`*, services(name), time_slots(slot_date, start_time, end_time)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
