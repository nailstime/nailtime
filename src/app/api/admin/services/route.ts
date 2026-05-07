import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

type ServicePayload = Database['public']['Tables']['services']['Insert']
type NormalizedServicePayload = { data: ServicePayload } | { error: string }

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: unknown }

  if (data?.role !== 'admin') return null
  return supabase
}

function normalizeServicePayload(body: Record<string, unknown>): NormalizedServicePayload {
  const name = String(body.name ?? '').trim()
  const name_en = String(body.name_en ?? '').trim() || null
  const description = String(body.description ?? '').trim() || null
  const duration = Number(body.duration)
  const priceValue = body.price === '' || body.price === null || body.price === undefined ? null : Number(body.price)
  const sort_order = Number(body.sort_order ?? 0)

  if (!name) return { error: 'Service name is required' }
  if (!Number.isFinite(duration) || duration < 15) return { error: 'Duration must be at least 15 minutes' }
  if (duration % 15 !== 0) return { error: 'Duration must be divisible by 15 minutes' }
  if (priceValue !== null && (!Number.isFinite(priceValue) || priceValue < 0)) return { error: 'Price must be zero or more' }

  return {
    data: {
      name,
      name_en,
      description,
      duration,
      price: priceValue,
      is_active: Boolean(body.is_active ?? true),
      sort_order: Number.isFinite(sort_order) ? sort_order : 0,
    },
  }
}

export async function POST(request: Request) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const payload = normalizeServicePayload(body)
  if ('error' in payload) return NextResponse.json({ error: payload.error }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase.from('services') as any
  const { data, error } = await db
    .insert(payload.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const id = String(body.id ?? '')
  if (!id) return NextResponse.json({ error: 'Service id is required' }, { status: 400 })

  const payload = normalizeServicePayload(body)
  if ('error' in payload) return NextResponse.json({ error: payload.error }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase.from('services') as any
  const { data, error } = await db
    .update(payload.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Service id is required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase.from('services') as any
  const { error } = await db
    .update({ is_active: false })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
