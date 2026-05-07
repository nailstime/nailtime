import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getBookableSlots, getBookableSlotsForServices, getAllSlotsWithAvailability } from '@/lib/booking/availability'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const serviceId = searchParams.get('service_id')
  const serviceIds = searchParams.get('service_ids')
  const showAll = searchParams.get('show_all') === '1'

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
    if (showAll) {
      // Compute total duration for the selected services, then return all slots
      const { data: services } = await supabase
        .from('services')
        .select('duration')
        .in('id', ids)
        .eq('is_active', true)
      const totalDuration = (services ?? []).reduce((sum: number, s: { duration: number }) => sum + s.duration, 0)
      const { data, error } = await getAllSlotsWithAvailability(supabase, date, totalDuration || 60)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }
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
