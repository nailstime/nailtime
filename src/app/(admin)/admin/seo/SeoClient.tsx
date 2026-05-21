'use client'
import { useState } from 'react'

type SeoPage = {
  key: string; label: string; id: string | null
  title: string; description: string; og_title: string; og_description: string; og_image: string; keywords: string
}

export default function SeoClient({ settings: initial }: { settings: SeoPage[] }) {
  const [settings, setSettings] = useState<SeoPage[]>(initial)
  const [active, setActive] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const page = settings[active]

  function update(key: keyof SeoPage, val: string) {
    setSettings(s => s.map((p, i) => i === active ? { ...p, [key]: val } : p))
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    await fetch('/api/admin/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_key: page.key, title: page.title, description: page.description, og_title: page.og_title, og_description: page.og_description, og_image: page.og_image, keywords: page.keywords }),
    })
    setSaving(false)
    setSaved(true)
  }

  const FIELDS: { key: keyof SeoPage; label: string; hint?: string; textarea?: boolean }[] = [
    { key: 'title', label: 'Title Tag', hint: 'แสดงบน tab เบราวเซอร์และผลการค้นหา (50-60 ตัวอักษร)' },
    { key: 'description', label: 'Meta Description', hint: 'คำอธิบายในผลการค้นหา (150-160 ตัวอักษร)', textarea: true },
    { key: 'keywords', label: 'Keywords', hint: 'คั่นด้วยจุลภาค เช่น nail salon, ชลบุรี, ร้านทำเล็บ' },
    { key: 'og_title', label: 'OG Title', hint: 'หัวข้อเมื่อแชร์ใน Facebook/LINE (ถ้าว่างใช้ Title)' },
    { key: 'og_description', label: 'OG Description', hint: 'คำอธิบายเมื่อแชร์ (ถ้าว่างใช้ Description)', textarea: true },
    { key: 'og_image', label: 'OG Image URL', hint: 'URL รูปภาพสำหรับแชร์ (1200x630px แนะนำ)' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-site-dark mb-6">ตั้งค่า SEO</h1>

      {/* Page tabs */}
      <div className="flex gap-2 mb-8">
        {settings.map((s, i) => (
          <button key={s.key} onClick={() => { setActive(i); setSaved(false) }}
            className={`text-xs px-5 py-2 rounded-full font-medium transition-colors
              ${i === active ? 'bg-sand text-white' : 'bg-white text-site-gray border border-sand/20 hover:border-sand'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand/20 space-y-5">
        {FIELDS.map(f => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <label className="text-xs font-semibold uppercase tracking-widest text-site-gray">{f.label}</label>
              {f.hint && <span className="text-[10px] text-site-gray/70 max-w-xs text-right">{f.hint}</span>}
            </div>
            {f.textarea ? (
              <textarea value={page[f.key] as string} onChange={e => update(f.key, e.target.value)} rows={3}
                className="border border-sand/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-sand transition-colors resize-none" />
            ) : (
              <input type="text" value={page[f.key] as string} onChange={e => update(f.key, e.target.value)}
                className="border border-sand/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-sand transition-colors" />
            )}
            {(f.key === 'title' || f.key === 'description') && (
              <p className={`text-[10px] text-right ${(page[f.key] as string).length > (f.key === 'title' ? 60 : 160) ? 'text-amber-500' : 'text-site-gray/60'}`}>
                {(page[f.key] as string).length} ตัวอักษร
              </p>
            )}
          </div>
        ))}

        <button onClick={save} disabled={saving}
          className="rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase px-8 py-2.5 hover:bg-sand-dark transition-all disabled:opacity-50">
          {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกแล้ว' : 'บันทึก'}
        </button>
      </div>

      {/* Preview */}
      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-sand/20">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-site-gray mb-4">ตัวอย่างใน Google</h2>
        <div className="border border-gray-200 rounded-xl p-4 max-w-xl">
          <p className="text-blue-600 text-sm font-medium truncate">{page.title || 'ชื่อหน้า'}</p>
          <p className="text-green-700 text-xs mt-0.5">nailtime.vercel.app/{page.key === 'home' ? '' : page.key}</p>
          <p className="text-gray-600 text-xs mt-1 line-clamp-2">{page.description || 'คำอธิบายหน้า...'}</p>
        </div>
      </div>
    </div>
  )
}
