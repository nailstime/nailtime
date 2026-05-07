'use client'
import { Suspense, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Service = { id: string; name: string; name_en: string | null; duration: number; price: number | null }
type SlotRow = { id: string; slot_date: string; start_time: string; end_time: string; capacity: number; available: number }

const STEPS = ['บริการ', 'วันที่', 'เวลา', 'ข้อมูล']

function formatDateThai(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

function getDates(days = 30) {
  const result: string[] = []
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    result.push(d.toISOString().slice(0, 10))
  }
  return result
}

function BookingContent() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [services, setServices] = useState<Service[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [slots, setSlots] = useState<SlotRow[]>([])
  const [selectedSlot, setSelectedSlot] = useState<SlotRow | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', lineId: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingNo, setBookingNo] = useState('')
  const [userProfile, setUserProfile] = useState<{ full_name: string | null; phone: string | null } | null>(null)

  const dates = getDates(30)
  const supabase = createClient()
  const selectedServices = services.filter(service => selectedServiceIds.includes(service.id))
  const selectedServiceNames = selectedServices.map(service => service.name).join(', ')
  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0)

  useEffect(() => {
    supabase.from('services').select('id, name, name_en, duration, price').eq('is_active', true).order('sort_order')
      .then(({ data }) => { if (data) setServices(data) })

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).single() as { data: { full_name: string | null; phone: string | null } | null; error: unknown }
      if (data) {
        setUserProfile(data)
        setForm(f => ({ ...f, name: data.full_name ?? '', phone: data.phone ?? '' }))
      }
    })
  }, [])

  useEffect(() => {
    const serviceIds = searchParams.get('services')?.split(',').filter(Boolean) ?? []
    const date = searchParams.get('date')
    const slotId = searchParams.get('slot')

    if (serviceIds.length === 0 || !date || !slotId) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedServiceIds(serviceIds)
    setSelectedDate(date)

    const params = new URLSearchParams({ date, service_ids: serviceIds.join(',') })
    fetch(`/api/slots?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return
        setSlots(data)
        const slot = data.find((item: SlotRow) => item.id === slotId)
        if (slot) {
          setSelectedSlot(slot)
          setStep(3)
        }
      })
  }, [searchParams])

  const fetchSlots = useCallback(async (date: string) => {
    if (selectedServiceIds.length === 0) return

    setSlotsLoading(true)
    setSlots([])
    setSelectedSlot(null)
    const params = new URLSearchParams({ date, service_ids: selectedServiceIds.join(',') })
    const res = await fetch(`/api/slots?${params.toString()}`)
    const data = await res.json()
    setSlots(Array.isArray(data) ? data : [])
    setSlotsLoading(false)
  }, [selectedServiceIds])

  // Realtime subscription when on slot-selection step
  useEffect(() => {
    if (step !== 2 || !selectedDate) return

    fetchSlots(selectedDate)

    const channel = supabase
      .channel('bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchSlots(selectedDate)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [step, selectedDate, fetchSlots])

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const payload: Record<string, string> = {
      service_id: selectedServiceIds[0],
      service_ids: selectedServiceIds.join(','),
      slot_id: selectedSlot!.id,
      note: [`บริการที่เลือก: ${selectedServiceNames}`, form.note].filter(Boolean).join('\n'),
    }
    payload.guest_name = form.name
    payload.guest_phone = form.phone
    payload.guest_line_uid = form.lineId

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'เกิดข้อผิดพลาด'); setLoading(false); return }
    setBookingNo(data.booking_no)
    setStep(4)
    setLoading(false)
  }

  // Success screen
  if (step === 4) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-6">✓</div>
          <h1 className="text-2xl font-bold text-site-dark mb-2">จองสำเร็จ!</h1>
          <p className="text-site-gray mb-1">หมายเลขการจอง</p>
          <p className="text-2xl font-bold text-sand mb-6">{bookingNo}</p>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand/20 text-left mb-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-site-gray">บริการ</span><span className="font-medium text-right">{selectedServiceNames}</span></div>
            <div className="flex justify-between"><span className="text-site-gray">วันที่</span><span className="font-medium">{formatDateThai(selectedSlot!.slot_date)}</span></div>
            <div className="flex justify-between"><span className="text-site-gray">เวลา</span><span className="font-medium">{formatTime(selectedSlot!.start_time)} – {formatTime(selectedSlot!.end_time)} น.</span></div>
            <div className="flex justify-between"><span className="text-site-gray">ชื่อ</span><span className="font-medium">{form.name || userProfile?.full_name}</span></div>
          </div>
          <p className="text-xs text-site-gray mb-6">กรุณาตรงต่อเวลา หากต้องการยกเลิกกรุณาแจ้งล่วงหน้า 2 ชั่วโมง</p>
          <Link href="/" className="block rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase py-3.5 text-center hover:bg-sand-dark transition-all">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-sand/20 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4">
          <Link href="/" className="text-lg font-bold text-site-dark">
            Nail Time <span className="text-sand">&amp; Spa</span>
          </Link>
          {/* Step indicators */}
          <div className="flex items-center gap-0 mt-3">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                    ${i < step ? 'bg-sand text-white' : i === step ? 'bg-sand text-white ring-4 ring-sand/20' : 'bg-sand/20 text-sand'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 ${i === step ? 'text-sand font-semibold' : 'text-site-gray'}`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 -mt-4 transition-colors ${i < step ? 'bg-sand' : 'bg-sand/20'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Step 0: Select Service */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold text-site-dark mb-6">เลือกบริการ</h2>
            <div className="space-y-3">
              {services.map(s => {
                const selected = selectedServiceIds.includes(s.id)
                return (
                <button key={s.id} onClick={() => {
                  setSelectedServiceIds(current => selected ? current.filter(id => id !== s.id) : [...current, s.id])
                }}
                  className="w-full bg-white rounded-2xl p-5 shadow-sm border border-sand/20 text-left hover:border-sand hover:shadow-md transition-all flex justify-between items-center group">
                  <div>
                    <p className="font-semibold text-site-dark">{s.name}</p>
                    {s.name_en && <p className="text-xs text-site-gray mt-0.5">{s.name_en}</p>}
                    <p className="text-xs text-site-gray mt-1">ระยะเวลา {s.duration} นาที</p>
                  </div>
                  <div className="text-right">
                    {s.price && <p className="text-sand font-bold">{s.price.toLocaleString()} ฿</p>}
                    <span className={`text-xs inline-block mt-1 ${selected ? 'text-green-600' : 'text-sand group-hover:translate-x-1 transition-transform'}`}>
                      {selected ? 'เลือกแล้ว' : '+'}
                    </span>
                  </div>
                </button>
              )})}
              <button disabled={selectedServiceIds.length === 0} onClick={() => setStep(1)}
                className="w-full rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase py-3.5 hover:bg-sand-dark transition-all disabled:opacity-50 mt-2">
                เลือกวันที่
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Select Date */}
        {step === 1 && (
          <div>
            <button onClick={() => setStep(0)} className="text-xs text-site-gray mb-4 hover:text-sand transition-colors flex items-center gap-1">
              ← {selectedServices.length} บริการ · {totalDuration} นาที
            </button>
            <h2 className="text-xl font-bold text-site-dark mb-6">เลือกวันที่</h2>
            <div className="grid grid-cols-2 gap-3">
              {dates.map(date => {
                const d = new Date(date + 'T00:00:00')
                const isToday = date === new Date().toISOString().slice(0, 10)
                return (
                  <button key={date} onClick={() => { setSelectedDate(date); setStep(2) }}
                    className={`bg-white rounded-2xl p-4 shadow-sm border border-sand/20 text-left hover:border-sand hover:shadow-md transition-all
                      ${selectedDate === date ? 'border-sand ring-2 ring-sand/20' : ''}`}>
                    <p className="text-xs text-site-gray">{d.toLocaleDateString('th-TH', { weekday: 'short' })}</p>
                    <p className="text-2xl font-bold text-site-dark">{d.getDate()}</p>
                    <p className="text-xs text-site-gray">{d.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })}</p>
                    {isToday && <span className="text-[10px] bg-sand/20 text-sand px-2 py-0.5 rounded-full mt-1 inline-block">วันนี้</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Select Time Slot */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="text-xs text-site-gray mb-4 hover:text-sand transition-colors flex items-center gap-1">
              ← {formatDateThai(selectedDate)}
            </button>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-site-dark">เลือกเวลา</h2>
              <span className="text-xs text-sand bg-sand/10 px-3 py-1 rounded-full">อัปเดตสด</span>
            </div>
            {slotsLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-sand/10" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-site-gray text-sm">ไม่มีเวลาว่างในวันนี้</p>
                <button onClick={() => setStep(1)} className="text-sand text-sm mt-2 hover:underline">เลือกวันอื่น</button>
              </div>
            ) : (
              <div className="space-y-3">
                {slots.map(slot => {
                  const full = slot.available <= 0
                  return (
                    <button key={slot.id} disabled={full}
                      onClick={() => { setSelectedSlot(slot); setStep(3) }}
                      className={`w-full bg-white rounded-2xl p-5 shadow-sm border text-left transition-all
                        ${full ? 'opacity-50 cursor-not-allowed border-sand/10' : 'border-sand/20 hover:border-sand hover:shadow-md'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-site-dark text-lg">{formatTime(slot.start_time)} – {formatTime(slot.end_time)} น.</p>
                        </div>
                        <div className="text-right">
                          {full ? (
                            <span className="text-xs bg-red-100 text-red-500 px-3 py-1 rounded-full">เต็มแล้ว</span>
                          ) : (
                            <div>
                              <span className={`text-xs px-3 py-1 rounded-full font-medium
                                ${slot.available <= 2 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                ว่าง {slot.available}/{slot.capacity}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Fill Details */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} className="text-xs text-site-gray mb-4 hover:text-sand transition-colors flex items-center gap-1">
              ← {formatTime(selectedSlot!.start_time)} – {formatTime(selectedSlot!.end_time)} น.
            </button>
            <h2 className="text-xl font-bold text-site-dark mb-2">ข้อมูลผู้จอง</h2>

            {/* Summary card */}
            <div className="bg-sand/10 rounded-2xl p-4 mb-6 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4"><span className="text-site-gray">บริการ</span><span className="font-medium text-right">{selectedServiceNames}</span></div>
              <div className="flex justify-between"><span className="text-site-gray">ระยะเวลา</span><span className="font-medium">{totalDuration} นาที</span></div>
              <div className="flex justify-between"><span className="text-site-gray">วันที่</span><span className="font-medium">{formatDateThai(selectedSlot!.slot_date)}</span></div>
              <div className="flex justify-between"><span className="text-site-gray">เวลา</span><span className="font-medium">{formatTime(selectedSlot!.start_time)} – {formatTime(selectedSlot!.end_time)} น.</span></div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-site-gray">ชื่อ-นามสกุล *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="border border-sand/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-sand transition-colors bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-site-gray">เบอร์โทรศัพท์ *</label>
                <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="border border-sand/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-sand transition-colors bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-site-gray">LINE ID</label>
                <input type="text" value={form.lineId} onChange={e => setForm(f => ({ ...f, lineId: e.target.value }))}
                  className="border border-sand/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-sand transition-colors bg-white" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-site-gray">หมายเหตุ (ถ้ามี)</label>
                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={3}
                  placeholder="เช่น แบบเล็บที่ต้องการ, สีที่ชอบ..."
                  className="border border-sand/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-sand transition-colors bg-white resize-none" />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button onClick={handleSubmit} disabled={loading || !form.name || !form.phone}
                className="w-full rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase py-3.5 hover:bg-sand-dark transition-all disabled:opacity-50 mt-2">
                {loading ? 'กำลังยืนยัน...' : 'ยืนยันการจอง'}
              </button>

              {!userProfile && (
                <p className="text-center text-xs text-site-gray">
                  มีบัญชีแล้ว?{' '}
                  <Link href={`/login?redirect=/booking`} className="text-sand font-semibold">เข้าสู่ระบบ</Link>
                  {' '}เพื่อจองได้เร็วขึ้น
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <BookingContent />
    </Suspense>
  )
}
