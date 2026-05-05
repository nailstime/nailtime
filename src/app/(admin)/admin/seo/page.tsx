import { createClient } from '@/lib/supabase/server'
import SeoClient from './SeoClient'

const DEFAULT_PAGES = [
  { key: 'home', label: 'หน้าหลัก' },
  { key: 'booking', label: 'จองนัด' },
  { key: 'services', label: 'บริการ' },
]

export default async function AdminSeoPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('seo_settings').select('*') as { data: { id: string; page_key: string; title: string | null; description: string | null; og_title: string | null; og_description: string | null; og_image: string | null; keywords: string | null }[] | null; error: unknown }

  const settings = DEFAULT_PAGES.map(p => {
    const row = rows?.find(r => r.page_key === p.key)
    return {
      ...p,
      id: row?.id ?? null,
      title: row?.title ?? '',
      description: row?.description ?? '',
      og_title: row?.og_title ?? '',
      og_description: row?.og_description ?? '',
      og_image: row?.og_image ?? '',
      keywords: row?.keywords ?? '',
    }
  })

  return <SeoClient settings={settings} />
}
