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

export async function POST(request: Request) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase.from('time_slots') as any

  if (body.bulk) {
    const { from_date, to_date, days, start_time, end_time, capacity } = body
    const interval = 15
    const allowedDays = (days as string).split(',').map(Number)
    const rows: Record<string, unknown>[] = []

    const current = new Date(from_date + 'T00:00:00')
    const end = new Date(to_date + 'T00:00:00')

    while (current <= end) {
      if (allowedDays.includes(current.getDay())) {
        const dateStr = current.toISOString().slice(0, 10)
        const [startH, startM] = (start_time as string).split(':').map(Number)
        const [endH, endM] = (end_time as string).split(':').map(Number)
        let cursor = startH * 60 + startM
        const endMinutes = endH * 60 + endM

        while (cursor + interval <= endMinutes) {
          const sh = String(Math.floor(cursor / 60)).padStart(2, '0')
          const sm = String(cursor % 60).padStart(2, '0')
          const eh = String(Math.floor((cursor + interval) / 60)).padStart(2, '0')
          const em = String((cursor + interval) % 60).padStart(2, '0')
          rows.push({ slot_date: dateStr, start_time: `${sh}:${sm}`, end_time: `${eh}:${em}`, capacity })
          cursor += interval
        }
      }
      current.setDate(current.getDate() + 1)
    }

    const { error } = await db.insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ created: rows.length })
  }

  const { slot_date, start_time, end_time, capacity } = body
  const [startH, startM] = (start_time as string).split(':').map(Number)
  const [endH, endM] = (end_time as string).split(':').map(Number)
  if (endH * 60 + endM - (startH * 60 + startM) !== 15) {
    return NextResponse.json({ error: 'Time slot must be exactly 15 minutes' }, { status: 400 })
  }
  const { data, error } = await db.insert({ slot_date, start_time, end_time, capacity }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, is_active } = await request.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('time_slots') as any).update({ is_active }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()
  const { error } = await supabase.from('time_slots').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
