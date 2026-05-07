import { createClient } from '@/lib/supabase/server'
import BookingsClient from './BookingsClient'

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const page = parseInt(params.page ?? '1')
  const limit = 25
  const from = (page - 1) * limit

  let query = supabase
    .from('bookings')
    .select(`*, services(name, duration), time_slots(slot_date, start_time, end_time), profiles(full_name, phone)`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (params.status) query = query.eq('status', params.status)
  if (params.date) query = query.eq('time_slots.slot_date', params.date)

  const { data: bookings, count } = await query

  return (
    <BookingsClient
      bookings={bookings ?? []}
      total={count ?? 0}
      page={page}
      limit={limit}
      currentStatus={params.status ?? ''}
    />
  )
}
