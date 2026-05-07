import { createClient } from '@/lib/supabase/server'
import BookingsClient from './BookingsClient'

function bangkokToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date())
}

function bangkokNowMins() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date())
  const h = Number(parts.find(p => p.type === 'hour')?.value ?? 0)
  const m = Number(parts.find(p => p.type === 'minute')?.value ?? 0)
  return h * 60 + m
}

function localDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return localDate(d)
}

function getMondayOf(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return localDate(d)
}

export default async function AdminBookingsPage() {
  const today = bangkokToday()
  const nowMins = bangkokNowMins()
  const startDate = getMondayOf(today)
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  const supabase = await createClient()

  const [{ data: slots }, { data: bookings }, { data: services }] = await Promise.all([
    supabase
      .from('time_slots')
      .select('id, slot_date, start_time, end_time, capacity')
      .in('slot_date', dates)
      .eq('is_active', true)
      .order('start_time'),

    supabase
      .from('bookings')
      .select('*, services(name, duration), profiles(full_name, phone)')
      .in('slot_date', dates)
      .order('start_time'),

    supabase
      .from('services')
      .select('id, name, duration')
      .eq('is_active', true)
      .order('name'),
  ])

  return (
    <BookingsClient
      initialSlots={slots ?? []}
      initialBookings={bookings ?? []}
      services={services ?? []}
      initialStartDate={startDate}
      today={today}
      nowMins={nowMins}
    />
  )
}
