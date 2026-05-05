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
  const { page_key, title, description, og_title, og_description, og_image, keywords } = body

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('seo_settings') as any)
    .upsert({ page_key, title, description, og_title, og_description, og_image, keywords }, { onConflict: 'page_key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
