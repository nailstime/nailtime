import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getBookableSlots, getBookableSlotsForServices } from '@/lib/booking/availability'
import { notifyNewBooking } from '@/lib/telegram'

export async function POST(request: Request) {
  const body = await request.json()
  const { service_id, service_ids, slot_id, guest_name, guest_phone, guest_line_uid, note } = body
  const selectedServiceIds = typeof service_ids === 'string'
    ? service_ids.split(',').map((id: string) => id.trim()).filter(Boolean)
    : service_id ? [service_id] : []

  if (selectedServiceIds.length === 0 || !slot_id) {
    return NextResponse.json({ error: 'service_ids and slot_id are required' }, { status: 400 })
  }

  const supabase = await createClient()
  let adminSupabase: ReturnType<typeof createAdminClient>

  try {
    adminSupabase = createAdminClient()
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }

  const { data: slot, error: slotErr } = await adminSupabase
    .from('time_slots')
    .select('slot_date')
    .eq('id', slot_id)
    .single() as { data: { slot_date: string } | null; error: unknown }

  if (slotErr || !slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })

  const { data: availableSlots, error: availabilityError } = selectedServiceIds.length > 1
    ? await getBookableSlotsForServices(adminSupabase, slot.slot_date, selectedServiceIds)
    : await getBookableSlots(adminSupabase, slot.slot_date, selectedServiceIds[0])
  if (availabilityError) return NextResponse.json({ error: availabilityError.message }, { status: 500 })

  const requestedSlot = availableSlots?.find(s => s.id === slot_id)
  if (!requestedSlot) {
    return NextResponse.json({ error: 'Selected time is not available for this service duration' }, { status: 409 })
  }

  const { data: { user } } = await supabase.auth.getUser()

  const insertPayload: Record<string, unknown> = {
    service_id: selectedServiceIds[0],
    slot_id,
    slot_date: requestedSlot.slot_date,
    start_time: requestedSlot.start_time,
    end_time: requestedSlot.end_time,
    note: note || null,
    status: 'pending',
  }

  if (user) {
    insertPayload.user_id = user.id
  } else {
    if (!guest_name || (!guest_phone && !guest_line_uid)) {
      return NextResponse.json({ error: 'Name and phone or LINE user id are required for guest booking' }, { status: 400 })
    }
  }

  insertPayload.guest_name = guest_name || null
  insertPayload.guest_phone = guest_phone || null
  insertPayload.guest_line_uid = guest_line_uid || null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminSupabase.from('bookings') as any)
    .insert(insertPayload)
    .select('booking_no, slot_date, start_time, end_time, guest_name, guest_phone, note, services(name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fire-and-forget Telegram notification (don't block response)
  notifyNewBooking({
    booking_no: data.booking_no,
    guest_name: data.guest_name ?? '—',
    guest_phone: data.guest_phone ?? null,
    service_name: data.services?.name ?? '',
    slot_date: data.slot_date,
    start_time: data.start_time,
    end_time: data.end_time,
    note: data.note ?? null,
  }).catch(() => {})

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
    .select(`*, services(name, duration), time_slots(slot_date, start_time, end_time)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
