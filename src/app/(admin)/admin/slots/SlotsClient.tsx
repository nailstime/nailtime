'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Slot = { id: string; slot_date: string; start_time: string; end_time: string; capacity: number; is_active: boolean }

function formatTime(t: string) { return t.slice(0, 5) }

function groupByDate(slots: Slot[]) {
  return slots.reduce<Record<string, Slot[]>>((acc, s) => {
    if (!acc[s.slot_date]) acc[s.slot_date] = []
    acc[s.slot_date].push(s)
    return acc
  }, {})
}

export default function SlotsClient({ slots: initial }: { slots: Slot[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ slot_date: '', start_time: '10:00', end_time: '10:15', capacity: '3' })
  const [bulkForm, setBulkForm] = useState({ from_date: '', to_date: '', days: '1,2,3,4,5,6', start_time: '10:00', end_time: '18:00', interval: '15', capacity: '3' })
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'single' | 'bulk'>('single')

  const grouped = groupByDate(initial)

  async function createSlot() {
    setLoading(true)
    const res = await fetch('/api/admin/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tab === 'single' ? { ...form, capacity: parseInt(form.capacity) }
        : { bulk: true, ...bulkForm, capacity: parseInt(bulkForm.capacity), interval: parseInt(bulkForm.interval) }),
    })
    setLoading(false)
    if (res.ok) { setShowForm(false); router.refresh() }
  }

  async function toggleSlot(id: string, is_active: boolean) {
    await fetch('/api/admin/slots', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !is_active }),
    })
    router.refresh()
  }

  async function deleteSlot(id: string) {
    if (!confirm('ลบช่วงเวลานี้?')) return
    await fetch('/api/admin/slots', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  const DAY_LABELS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-site-dark">ช่วงเวลาว่าง</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="text-xs bg-sand text-white rounded-full px-5 py-2 hover:bg-sand-dark transition-colors font-medium">
          {showForm ? 'ปิด' : '+ เพิ่มช่วงเวลา'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand/20 mb-8">
          <div className="flex gap-2 mb-5">
            {(['single', 'bulk'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-xs px-4 py-1.5 rounded-full font-medium transition-colors ${tab === t ? 'bg-sand text-white' : 'bg-sand/10 text-sand'}`}>
                {t === 'single' ? 'เพิ่มทีละช่วง' : 'เพิ่มแบบกลุ่ม'}
              </button>
            ))}
          </div>

          {tab === 'single' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">วันที่</label>
                <input type="date" value={form.slot_date} onChange={e => setForm(f => ({ ...f, slot_date: e.target.value }))}
                  className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">เริ่ม</label>
                <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                  className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">สิ้นสุด</label>
                <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                  className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">จำนวนที่นั่ง</label>
                <input type="number" min="1" max="20" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                  className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">จาก</label>
                  <input type="date" value={bulkForm.from_date} onChange={e => setBulkForm(f => ({ ...f, from_date: e.target.value }))}
                    className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">ถึง</label>
                  <input type="date" value={bulkForm.to_date} onChange={e => setBulkForm(f => ({ ...f, to_date: e.target.value }))}
                    className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">วันที่เปิด</label>
                <div className="flex gap-2 flex-wrap">
                  {DAY_LABELS.map((d, i) => {
                    const active = bulkForm.days.split(',').includes(String(i))
                    return (
                      <button key={i} type="button"
                        onClick={() => {
                          const days = bulkForm.days.split(',').filter(Boolean)
                          const si = String(i)
                          const next = active ? days.filter(x => x !== si) : [...days, si]
                          setBulkForm(f => ({ ...f, days: next.sort().join(',') }))
                        }}
                        className={`w-9 h-9 rounded-full text-xs font-medium transition-colors
                          ${active ? 'bg-sand text-white' : 'bg-sand/10 text-sand hover:bg-sand/20'}`}>
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">เริ่ม</label>
                  <input type="time" value={bulkForm.start_time} onChange={e => setBulkForm(f => ({ ...f, start_time: e.target.value }))}
                    className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">สิ้นสุด</label>
                  <input type="time" value={bulkForm.end_time} onChange={e => setBulkForm(f => ({ ...f, end_time: e.target.value }))}
                    className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">ทุก (นาที)</label>
                  <input type="number" min="15" max="180" step="15" value={bulkForm.interval}
                    onChange={e => setBulkForm(f => ({ ...f, interval: e.target.value }))}
                    disabled
                    className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none bg-cream text-site-gray" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-site-gray uppercase tracking-wide">จำนวนที่นั่งต่อช่วง</label>
                <input type="number" min="1" max="20" value={bulkForm.capacity}
                  onChange={e => setBulkForm(f => ({ ...f, capacity: e.target.value }))}
                  className="border border-sand/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-sand w-24" />
              </div>
            </div>
          )}

          <button onClick={createSlot} disabled={loading}
            className="mt-5 rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase px-8 py-2.5 hover:bg-sand-dark transition-all disabled:opacity-50">
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      )}

      {/* Slots grouped by date */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-site-gray text-sm text-center py-12">ยังไม่มีช่วงเวลาว่าง</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, daySlots]) => {
            const d = new Date(date + 'T00:00:00')
            return (
              <div key={date}>
                <h3 className="text-sm font-semibold text-site-gray mb-3">
                  {d.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {daySlots.map(slot => (
                    <div key={slot.id}
                      className={`bg-white rounded-xl p-4 border transition-all ${slot.is_active ? 'border-sand/20' : 'border-red-100 opacity-60'}`}>
                      <p className="font-bold text-site-dark">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</p>
                      <p className="text-xs text-site-gray mt-0.5">ที่นั่ง {slot.capacity} ที่</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => toggleSlot(slot.id, slot.is_active)}
                          className={`text-xs px-2 py-1 rounded-md transition-colors flex-1
                            ${slot.is_active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                          {slot.is_active ? 'ปิด' : 'เปิด'}
                        </button>
                        <button onClick={() => deleteSlot(slot.id)}
                          className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          ลบ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
