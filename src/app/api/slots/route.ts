import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getBookableSlots, getBookableSlotsForServices } from '@/lib/booking/availability'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const serviceId = searchParams.get('service_id')
  const serviceIds = searchParams.get('service_ids')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  let supabase: ReturnType<typeof createAdminClient>

  try {
    supabase = createAdminClient()
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }

  if (serviceIds) {
    const ids = serviceIds.split(',').map(id => id.trim()).filter(Boolean)
    const { data, error } = await getBookableSlotsForServices(supabase, date, ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (serviceId) {
    const { data, error } = await getBookableSlots(supabase, date, serviceId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('slot_availability')
    .select('*')
    .eq('slot_date', date)
    .eq('is_active', true)
    .order('start_time')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
