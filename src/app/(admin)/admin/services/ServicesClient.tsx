'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Plus, Trash2 } from 'lucide-react'

type Service = {
  id: string
  name: string
  name_en: string | null
  description: string | null
  duration: number
  price: number | null
  is_active: boolean
  sort_order: number
}

type ServiceForm = {
  name: string
  name_en: string
  description: string
  duration: string
  price: string
  is_active: boolean
  sort_order: string
}

const emptyForm: ServiceForm = {
  name: '',
  name_en: '',
  description: '',
  duration: '30',
  price: '',
  is_active: true,
  sort_order: '0',
}

function serviceToForm(service: Service): ServiceForm {
  return {
    name: service.name,
    name_en: service.name_en ?? '',
    description: service.description ?? '',
    duration: String(service.duration),
    price: service.price === null ? '' : String(service.price),
    is_active: service.is_active,
    sort_order: String(service.sort_order ?? 0),
  }
}

function slotCount(duration: number) {
  return Math.ceil(duration / 15)
}

export default function ServicesClient({ services }: { services: Service[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Service | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function startCreate() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
    setError('')
  }

  function startEdit(service: Service) {
    setEditing(service)
    setForm(serviceToForm(service))
    setShowForm(true)
    setError('')
  }

  async function saveService() {
    setLoading(true)
    setError('')

    const payload = {
      id: editing?.id,
      name: form.name,
      name_en: form.name_en,
      description: form.description,
      duration: Number(form.duration),
      price: form.price === '' ? null : Number(form.price),
      is_active: form.is_active,
      sort_order: Number(form.sort_order),
    }

    const res = await fetch('/api/admin/services', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'บันทึกบริการไม่สำเร็จ')
      return
    }

    setShowForm(false)
    setEditing(null)
    setForm(emptyForm)
    router.refresh()
  }

  async function deleteService(service: Service) {
    if (!confirm(`ปิดบริการ "${service.name}"? ลูกค้าจะไม่เห็นบริการนี้ในหน้าจอง`)) return

    const res = await fetch('/api/admin/services', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: service.id }),
    })

    if (!res.ok) {
      const data = await res.json()
      alert(data.error ?? 'ปิดบริการไม่สำเร็จ')
      return
    }

    router.refresh()
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-site-dark">บริการ</h1>
          <p className="text-sm text-site-gray mt-1">ตั้งค่าราคาและเวลาที่ใช้ ระบบจะคิด slot ละ 15 นาที</p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase px-5 py-2.5 hover:bg-sand-dark transition-colors"
        >
          <Plus size={15} />
          เพิ่มบริการ
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand/20 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">ชื่อบริการ *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">ชื่ออังกฤษ</label>
              <input
                value={form.name_en}
                onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand"
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">รายละเอียด</label>
              <textarea
                value={form.description}
                rows={2}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">เวลา (นาที)</label>
              <input
                type="number"
                min="15"
                step="15"
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand"
              />
              <span className="text-[11px] text-site-gray">เช่น 30 นาที = {slotCount(Number(form.duration || 0)) || 0} slot</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">ราคา</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">ลำดับ</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-site-dark pt-6">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 accent-sand"
              />
              เปิดให้ลูกค้าจอง
            </label>
          </div>

          {error && <p className="text-red-500 text-xs mt-4">{error}</p>}

          <div className="flex gap-3 mt-5">
            <button
              onClick={saveService}
              disabled={loading}
              className="rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase px-8 py-2.5 hover:bg-sand-dark transition-all disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-full border border-sand/40 text-sand-dark text-xs font-medium tracking-widest uppercase px-6 py-2.5 hover:border-sand transition-all"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-sand/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/50">
              <tr>
                {['บริการ', 'เวลา', 'ราคา', 'สถานะ', 'จัดการ'].map(header => (
                  <th key={header} className="text-left px-4 py-3 text-xs font-semibold text-site-gray uppercase tracking-wide whitespace-nowrap">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id} className="border-t border-sand/10 hover:bg-cream/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-site-dark">{service.name}</p>
                    {service.name_en && <p className="text-xs text-site-gray">{service.name_en}</p>}
                    {service.description && <p className="text-xs text-site-gray mt-1 max-w-sm">{service.description}</p>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-medium">{service.duration} นาที</p>
                    <p className="text-xs text-site-gray">{slotCount(service.duration)} slot</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {service.price === null ? <span className="text-site-gray">สอบถาม</span> : <span className="font-semibold text-sand">{service.price.toLocaleString()} บาท</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${service.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      {service.is_active ? 'เปิด' : 'ปิด'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(service)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sand/10 text-sand hover:bg-sand/20 transition-colors"
                        aria-label="แก้ไขบริการ"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => deleteService(service)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        aria-label="ปิดบริการ"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
