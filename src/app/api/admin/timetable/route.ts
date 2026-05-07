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

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function GET(request: Request) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const start = new URL(request.url).searchParams.get('start') ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    return NextResponse.json({ error: 'Invalid start date' }, { status: 400 })
  }

  const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  const [{ data: slots }, { data: bookings }] = await Promise.all([
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
  ])

  return NextResponse.json({ slots: slots ?? [], bookings: bookings ?? [] })
}
