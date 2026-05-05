'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

declare global {
  interface Window { liff: any }
}

type Service = { id: string; name: string; duration: number; price: number | null }
type SlotRow = { id: string; slot_date: string; start_time: string; end_time: string; capacity: number; available: number }

const STEPS = ['บริการ', 'วัน', 'เวลา', 'ยืนยัน']

function formatTime(t: string) { return t.slice(0, 5) }
function formatDateThai(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })
}

function getDates(days = 21) {
  const result: string[] = []
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    result.push(d.toISOString().slice(0, 10))
  }
  return result
}

export default function LiffBookingPage() {
  const [liffReady, setLiffReady] = useState(false)
  const [liffError, setLiffError] = useState('')
  const [lineProfile, setLineProfile] = useState<{ displayName: string; userId: string; pictureUrl?: string } | null>(null)
  const [step, setStep] = useState(0)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<SlotRow[]>([])
  const [selectedSlot, setSelectedSlot] = useState<SlotRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [bookingNo, setBookingNo] = useState('')
  const supabase = createClient()
  const dates = getDates(21)

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID
    if (!liffId) { setLiffError('LIFF ID not configured'); return }

    const script = document.createElement('script')
    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js'
    script.onload = async () => {
      try {
        await window.liff.init({ liffId })
        if (!window.liff.isLoggedIn()) {
          window.liff.login({ redirectUri: window.location.href })
          return
        }
        const profile = await window.liff.getProfile()
        setLineProfile(profile)
        setLiffReady(true)
      } catch (e: any) {
        setLiffError(e.message ?? 'LIFF init failed')
      }
    }
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    supabase.from('services').select('id, name, duration, price').eq('is_active', true).order('sort_order')
      .then(({ data }) => { if (data) setServices(data) })
  }, [])

  const fetchSlots = useCallback(async (date: string) => {
    const res = await fetch(`/api/slots?date=${date}`)
    const data = await res.json()
    setSlots(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    if (step !== 2 || !selectedDate) return
    fetchSlots(selectedDate)
    const channel = supabase.channel('liff-slots')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchSlots(selectedDate))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [step, selectedDate, fetchSlots])

  async function handleBook() {
    setLoading(true)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: selectedService!.id,
        slot_id: selectedSlot!.id,
        guest_name: lineProfile!.displayName,
        guest_line_uid: lineProfile!.userId,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) { setBookingNo(data.booking_no); setStep(4) }
  }

  if (liffError) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-site-gray text-sm">{liffError}</p>
          <p className="text-xs text-site-gray mt-2">กรุณาเปิดผ่าน LINE</p>
        </div>
      </div>
    )
  }

  if (!liffReady) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-sand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-site-gray text-sm">กำลังเชื่อมต่อ LINE...</p>
        </div>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          <h1 className="text-xl font-bold text-site-dark mb-1">จองสำเร็จ!</h1>
          <p className="text-sand font-bold text-2xl mb-4">{bookingNo}</p>
          <div className="bg-white rounded-2xl p-5 text-sm text-left space-y-2 shadow-sm border border-sand/20 mb-6">
            <div className="flex justify-between"><span className="text-site-gray">บริการ</span><span>{selectedService?.name}</span></div>
            <div className="flex justify-between"><span className="text-site-gray">วันที่</span><span>{formatDateThai(selectedSlot!.slot_date)}</span></div>
            <div className="flex justify-between"><span className="text-site-gray">เวลา</span><span>{formatTime(selectedSlot!.start_time)} – {formatTime(selectedSlot!.end_time)}</span></div>
          </div>
          <button onClick={() => window.liff.closeWindow()}
            className="w-full rounded-full bg-[#06C755] text-white text-sm font-medium py-3 hover:bg-[#05b04c] transition-colors">
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* LINE-style header */}
      <div className="bg-[#06C755] text-white px-5 py-4 flex items-center gap-3">
        {lineProfile?.pictureUrl && (
          <img src={lineProfile.pictureUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
        )}
        <div>
          <p className="text-xs opacity-80">สวัสดี {lineProfile?.displayName}</p>
          <p className="text-sm font-bold">Nail Time &amp; Spa — จองนัด</p>
        </div>
      </div>

      {/* Step bar */}
      <div className="bg-white border-b border-sand/20 px-5 py-3 flex gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? 'bg-[#06C755]' : 'bg-sand/20'}`} />
        ))}
      </div>

      <div className="max-w-sm mx-auto px-5 py-6">
        {/* Step 0: Service */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold text-site-dark mb-4">เลือกบริการ</h2>
            <div className="space-y-3">
              {services.map(s => (
                <button key={s.id} onClick={() => { setSelectedService(s); setStep(1) }}
                  className="w-full bg-white rounded-xl p-4 shadow-sm border border-sand/20 text-left hover:border-[#06C755] transition-all flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-site-dark">{s.name}</p>
                    <p className="text-xs text-site-gray">{s.duration} นาที</p>
                  </div>
                  {s.price && <p className="text-sand font-bold">{s.price.toLocaleString()} ฿</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Date */}
        {step === 1 && (
          <div>
            <button onClick={() => setStep(0)} className="text-xs text-site-gray mb-3 hover:text-sand">← {selectedService?.name}</button>
            <h2 className="text-lg font-bold text-site-dark mb-4">เลือกวันที่</h2>
            <div className="grid grid-cols-3 gap-2">
              {dates.map(date => {
                const d = new Date(date + 'T00:00:00')
                return (
                  <button key={date} onClick={() => { setSelectedDate(date); setStep(2) }}
                    className="bg-white rounded-xl p-3 shadow-sm border border-sand/20 text-center hover:border-[#06C755] transition-all">
                    <p className="text-[10px] text-site-gray">{d.toLocaleDateString('th-TH', { weekday: 'short' })}</p>
                    <p className="text-xl font-bold text-site-dark">{d.getDate()}</p>
                    <p className="text-[10px] text-site-gray">{d.toLocaleDateString('th-TH', { month: 'short' })}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Slot */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="text-xs text-site-gray mb-3 hover:text-sand">← {formatDateThai(selectedDate)}</button>
            <h2 className="text-lg font-bold text-site-dark mb-4">เลือกเวลา</h2>
            {slots.length === 0 ? (
              <p className="text-site-gray text-sm text-center py-8">ไม่มีเวลาว่าง</p>
            ) : (
              <div className="space-y-2">
                {slots.map(slot => {
                  const full = slot.available <= 0
                  return (
                    <button key={slot.id} disabled={full}
                      onClick={() => { setSelectedSlot(slot); setStep(3) }}
                      className={`w-full bg-white rounded-xl p-4 shadow-sm border text-left transition-all flex justify-between items-center
                        ${full ? 'opacity-40 cursor-not-allowed border-sand/10' : 'border-sand/20 hover:border-[#06C755]'}`}>
                      <p className="font-bold">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</p>
                      {full ? (
                        <span className="text-xs text-red-500">เต็ม</span>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${slot.available <= 2 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                          ว่าง {slot.available}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} className="text-xs text-site-gray mb-3 hover:text-sand">← เปลี่ยนเวลา</button>
            <h2 className="text-lg font-bold text-site-dark mb-4">ยืนยันการจอง</h2>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-sand/20 space-y-3 text-sm mb-5">
              <div className="flex justify-between"><span className="text-site-gray">ชื่อ</span><span className="font-medium">{lineProfile?.displayName}</span></div>
              <div className="flex justify-between"><span className="text-site-gray">บริการ</span><span className="font-medium">{selectedService?.name}</span></div>
              <div className="flex justify-between"><span className="text-site-gray">วันที่</span><span className="font-medium">{formatDateThai(selectedSlot!.slot_date)}</span></div>
              <div className="flex justify-between"><span className="text-site-gray">เวลา</span><span className="font-medium">{formatTime(selectedSlot!.start_time)} – {formatTime(selectedSlot!.end_time)}</span></div>
              {selectedService?.price && (
                <div className="flex justify-between border-t border-sand/10 pt-3"><span className="text-site-gray">ราคา</span><span className="font-bold text-sand">{selectedService.price.toLocaleString()} ฿</span></div>
              )}
            </div>
            <button onClick={handleBook} disabled={loading}
              className="w-full rounded-full bg-[#06C755] text-white font-medium py-3.5 hover:bg-[#05b04c] transition-colors disabled:opacity-50">
              {loading ? 'กำลังจอง...' : 'ยืนยันการจอง'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
