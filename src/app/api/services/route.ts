import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  let supabase: ReturnType<typeof createAdminClient>

  try {
    supabase = createAdminClient()
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('services')
    .select('id, name, duration, price')
    .eq('is_active', true)
    .order('sort_order')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
