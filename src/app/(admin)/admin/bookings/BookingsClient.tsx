'use client'
import { useState, useEffect, useRef } from 'react'

type Slot = {
  id: string
  slot_date: string
  start_time: string
  end_time: string
  capacity: number
}

type Booking = {
  id: string
  booking_no: string
  status: string
  slot_id: string
  slot_date: string | null
  start_time: string | null
  end_time: string | null
  guest_name: string | null
  guest_phone: string | null
  note: string | null
  services: { name: string; duration: number } | null
  profiles: { full_name: string; phone: string } | null
}

type Service = { id: string; name: string; duration: number }
type DetailCell = { slot: Slot; bookings: Booking[] }

const STATUS_LABEL: Record<string, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}

const CELL_BG: Record<string, string> = {
  pending: 'bg-amber-300 hover:bg-amber-400',
  confirmed: 'bg-green-300 hover:bg-green-400',
  completed: 'bg-stone-600 hover:bg-stone-700',
  cancelled: 'bg-red-100 hover:bg-red-200',
  empty: 'bg-sand/20 hover:bg-sand/40',
  past: 'bg-stone-100',
  blocked: 'bg-stone-100',
}

const CELL_TEXT: Record<string, string> = {
  pending: 'text-gray-700/80',
  confirmed: 'text-gray-700/80',
  completed: 'text-white/90',
  cancelled: 'text-gray-500/70',
}

const LEGEND_BG: Record<string, string> = {
  pending: 'bg-amber-300',
  confirmed: 'bg-green-300',
  completed: 'bg-stone-600',
  cancelled: 'bg-red-100',
}

function fmt(t?: string | null) { return t?.slice(0, 5) ?? '' }

function toMins(t: string) {
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

function localDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return localDate(d)
}

function getMondayOf(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return localDate(d)
}

function makeDates(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => shiftDate(start, i))
}

function shortDate(date: string, today: string) {
  const label = new Date(date + 'T00:00:00').toLocaleDateString('th-TH', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  return date === today ? `${label} ●` : label
}

function topStatus(bs: Booking[]): string | null {
  for (const s of ['pending', 'confirmed', 'completed', 'cancelled']) {
    if (bs.some(b => b.status === s)) return s
  }
  return null
}

const EMPTY_FORM = { serviceId: '', name: '', phone: '', note: '', status: 'confirmed' }

export default function BookingsClient({
  initialSlots,
  initialBookings,
  services,
  initialStartDate,
  today,
  nowMins,
}: {
  initialSlots: Slot[]
  initialBookings: Booking[]
  services: Service[]
  initialStartDate: string
  today: string
  nowMins: number
}) {
  const [startDate, setStartDate] = useState(initialStartDate)
  const [dates, setDates] = useState(() => makeDates(initialStartDate))
  const [slots, setSlots] = useState(initialSlots)
  const [bookings, setBookings] = useState(initialBookings)
  const [loadingWeek, setLoadingWeek] = useState(false)

  const [updating, setUpdating] = useState<string | null>(null)
  const [detailCell, setDetailCell] = useState<DetailCell | null>(null)
  const [createSlot, setCreateSlot] = useState<Slot | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set())
  const [completingBooking, setCompletingBooking] = useState<Booking | null>(null)
  const [completionEndTime, setCompletionEndTime] = useState('')
  const [completing, setCompleting] = useState(false)
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [closingDay, setClosingDay] = useState<string | null>(null)
  const [closingDayHasActive, setClosingDayHasActive] = useState(false)
  const [closingDayLoading, setClosingDayLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Booking[]>([])
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function fetchWeek(start: string) {
    setLoadingWeek(true)
    const res = await fetch(`/api/admin/timetable?start=${start}`)
    if (res.ok) {
      const data = await res.json()
      setSlots(data.slots)
      setBookings(data.bookings)
      setBlockedSlots(new Set())
    }
    setStartDate(start)
    setDates(makeDates(start))
    setLoadingWeek(false)
  }

  function applyUpdate(id: string, changes: Partial<Booking>) {
    const patch = (b: Booking) => b.id === id ? { ...b, ...changes } : b
    setBookings(prev => prev.map(patch))
    setSearchResults(prev => prev.map(patch))
  }

  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) { setSearchResults([]); return }
    if (searchRef.current) clearTimeout(searchRef.current)
    setSearching(true)
    searchRef.current = setTimeout(async () => {
      const res = await fetch(`/api/admin/bookings?q=${encodeURIComponent(q)}`)
      if (res.ok) setSearchResults(await res.json())
      setSearching(false)
    }, 300)
    return () => { if (searchRef.current) clearTimeout(searchRef.current) }
  }, [searchQuery])

  function isPast(slotDate: string, startTime: string) {
    if (slotDate < today) return true
    if (slotDate > today) return false
    return toMins(startTime) < nowMins
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    applyUpdate(id, { status })
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setUpdating(null)
  }

  function onStatusChange(booking: Booking, newStatus: string) {
    if (newStatus === 'completed') {
      setCompletingBooking(booking)
      setCompletionEndTime(fmt(booking.end_time))
    } else if (newStatus === 'cancelled') {
      setCancellingBooking(booking)
    } else {
      updateStatus(booking.id, newStatus)
    }
  }

  function tryCloseDay(date: string) {
    const daySlotIds = slots.filter(s => s.slot_date === date).map(s => s.id)
    const hasActive = daySlotIds.some(id => {
      if (blockedSlots.has(id)) return false
      return (bookingsBySlot[id] ?? []).some(b => b.status === 'pending' || b.status === 'confirmed')
    })
    setClosingDayHasActive(hasActive)
    setClosingDay(date)
  }

  async function confirmCloseDay() {
    if (!closingDay) return
    setClosingDayLoading(true)
    const toBlock = slots.filter(s => {
      if (s.slot_date !== closingDay) return false
      if (blockedSlots.has(s.id)) return false
      return !(bookingsBySlot[s.id] ?? []).some(b => b.status === 'completed')
    })
    await Promise.all(toBlock.map(s =>
      fetch('/api/admin/slots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, is_active: false }),
      })
    ))
    setBlockedSlots(prev => new Set([...prev, ...toBlock.map(s => s.id)]))
    setClosingDayLoading(false)
    setClosingDay(null)
  }

  async function confirmCancel() {
    if (!cancellingBooking) return
    setCancelling(true)
    applyUpdate(cancellingBooking.id, { status: 'cancelled' })
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cancellingBooking.id, status: 'cancelled' }),
    })
    setCancelling(false)
    setCancellingBooking(null)
    setDetailCell(null)
  }

  async function completeBooking() {
    if (!completingBooking || !completionEndTime) return
    setCompleting(true)
    const endTimeFull = completionEndTime + ':00'
    applyUpdate(completingBooking.id, { status: 'completed', end_time: endTimeFull })
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: completingBooking.id, status: 'completed', end_time: endTimeFull }),
    })
    setCompleting(false)
    setCompletingBooking(null)
  }

  function completionTimeOptions(booking: Booking): string[] {
    if (!booking.start_time || !booking.end_time) return []
    const start = toMins(booking.start_time) + 15
    const end = toMins(booking.end_time)
    const options: string[] = []
    for (let t = start; t <= end; t += 15) {
      options.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`)
    }
    return options
  }

  async function createBooking() {
    if (!createSlot || !form.serviceId || !form.name.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: createSlot.id,
          service_id: form.serviceId,
          guest_name: form.name.trim(),
          guest_phone: form.phone.trim() || null,
          note: form.note.trim() || null,
          status: form.status,
        }),
      })
      if (res.ok) {
        setCreateSlot(null)
        await fetchWeek(startDate)
      }
    } finally {
      setCreating(false)
    }
  }

  async function blockSlot(slotId: string) {
    await fetch('/api/admin/slots', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: slotId, is_active: false }),
    })
    setBlockedSlots(prev => new Set([...prev, slotId]))
    setCreateSlot(null)
  }

  const thisWeekStart = getMondayOf(today)

  const slotMap = slots.reduce<Record<string, Record<string, Slot>>>((acc, s) => {
    if (!acc[s.slot_date]) acc[s.slot_date] = {}
    acc[s.slot_date][s.start_time] = s
    return acc
  }, {})

  const bookingsBySlot = bookings.reduce<Record<string, Booking[]>>((acc, b) => {
    if (!acc[b.slot_id]) acc[b.slot_id] = []
    acc[b.slot_id].push(b)
    return acc
  }, {})

  const allTimes = Array.from(new Set(slots.map(s => s.start_time))).sort()

  function buildRowCells(date: string) {
    const dominated = new Set<string>()

    return allTimes.flatMap((time, idx) => {
      if (dominated.has(time)) return []

      const slot = slotMap[date]?.[time]
      if (!slot) {
        return [<td key={time} className="border border-sand/5 bg-stone-50/20 min-w-[2.5rem]" />]
      }

      if (blockedSlots.has(slot.id)) {
        return [<td key={time} className="border border-sand/10 p-0.5">
          <div className={`h-7 w-full rounded ${CELL_BG.blocked}`} />
        </td>]
      }

      const bs = bookingsBySlot[slot.id] ?? []
      const active = bs.filter(b => b.status !== 'cancelled')
      const past = isPast(date, slot.start_time)

      let slotsNeeded = 1
      if (active.length > 0) {
        const maxMins = Math.max(...active.map(b =>
          b.start_time && b.end_time ? toMins(b.end_time) - toMins(b.start_time) : b.services?.duration ?? 15
        ))
        slotsNeeded = Math.max(1, Math.ceil(maxMins / 15))
      }

      let span = 1
      for (let i = 1; i < slotsNeeded; i++) {
        const prev = allTimes[idx + i - 1]
        const next = allTimes[idx + i]
        if (!next || toMins(next) - toMins(prev) !== 15) break
        dominated.add(next)
        span++
      }

      const status = topStatus(bs)
      const activeCount = active.length
      const firstName = active[0]?.profiles?.full_name ?? active[0]?.guest_name ?? ''

      if (past && active.length === 0) {
        return [<td key={time} className="border border-sand/10 p-0.5">
          <div className={`h-7 w-full rounded ${CELL_BG.past}`} />
        </td>]
      }

      if (active.length > 0) {
        return [(
          <td key={time} colSpan={span} className="border border-sand/10 p-0.5">
            <button
              onClick={() => setDetailCell({ slot, bookings: bs })}
              className={`h-7 w-full rounded flex items-center gap-1 px-1.5 transition-colors overflow-hidden
                ${status ? CELL_BG[status] : CELL_BG.empty}`}>
              {activeCount > 0 && firstName && (
                <span className={`text-[10px] truncate leading-none flex-1 text-left font-medium ${status ? CELL_TEXT[status] : 'text-gray-700/80'}`}>
                  {firstName}
                </span>
              )}
              {activeCount > 1 && (
                <span className={`text-[10px] font-bold leading-none shrink-0 ${status ? CELL_TEXT[status] : 'text-gray-700/80'}`}>
                  +{activeCount - 1}
                </span>
              )}
            </button>
          </td>
        )]
      }

      return [<td key={time} className="border border-sand/10 p-0.5">
        <button
          onClick={() => { setCreateSlot(slot); setForm({ ...EMPTY_FORM, serviceId: services[0]?.id ?? '' }) }}
          className={`h-7 w-full rounded transition-colors ${CELL_BG.empty}`}
        />
      </td>]
    })
  }

  const modalCell = detailCell
    ? { ...detailCell, bookings: bookingsBySlot[detailCell.slot.id] ?? [] }
    : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-site-dark">ตารางการจอง</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-site-gray/40 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="เลขที่การจอง หรือ เบอร์โทร"
              className="pl-8 pr-3 h-9 text-sm border border-sand/20 rounded-xl outline-none focus:border-sand bg-white w-56 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-site-gray/40 hover:text-site-gray text-xs">✕</button>
            )}
          </div>
          <button
            onClick={() => fetchWeek(shiftDate(startDate, -7))}
            disabled={loadingWeek}
            className="px-3 h-9 rounded-xl border border-sand/20 bg-white text-site-gray hover:border-sand transition-colors text-sm disabled:opacity-40">
            ‹ ก่อนหน้า
          </button>
          <button
            onClick={() => fetchWeek(thisWeekStart)}
            disabled={loadingWeek}
            className={`px-3 h-9 rounded-xl border transition-colors text-sm disabled:opacity-40
              ${startDate === thisWeekStart ? 'bg-sand text-white border-sand' : 'bg-white text-site-gray border-sand/20 hover:border-sand'}`}>
            สัปดาห์นี้
          </button>
          <button
            onClick={() => fetchWeek(shiftDate(startDate, 7))}
            disabled={loadingWeek}
            className="px-3 h-9 rounded-xl border border-sand/20 bg-white text-site-gray hover:border-sand transition-colors text-sm disabled:opacity-40">
            ถัดไป ›
          </button>
        </div>
      </div>

      {/* Search results */}
      {searchQuery.trim().length >= 2 && (
        <div className="mb-6 bg-white rounded-2xl border border-sand/20 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-sand/10">
            <p className="text-xs font-medium text-site-gray">
              {searching ? 'กำลังค้นหา...' : `พบ ${searchResults.length} รายการ (การจองที่ยังไม่ถึง)`}
            </p>
          </div>
          {!searching && searchResults.length === 0 ? (
            <p className="text-sm text-site-gray/50 text-center py-6">ไม่พบการจอง</p>
          ) : (
            <div className="divide-y divide-sand/10">
              {searchResults.map(b => {
                const name = b.profiles?.full_name ?? b.guest_name ?? '—'
                const phone = b.profiles?.phone ?? b.guest_phone ?? ''
                const slotLabel = b.slot_date
                  ? new Date(b.slot_date + 'T00:00:00').toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })
                  : ''
                return (
                  <div key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-cream/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-site-dark">{name}</span>
                        {phone && <span className="text-xs text-site-gray">{phone}</span>}
                        <span className="text-xs font-mono text-site-gray/40">{b.booking_no}</span>
                      </div>
                      <p className="text-xs text-site-gray mt-0.5">
                        {slotLabel} · {fmt(b.start_time)}–{fmt(b.end_time)} · {b.services?.name}
                      </p>
                      {b.note && <p className="text-xs text-site-gray/50 italic">{b.note}</p>}
                    </div>
                    {b.status === 'completed' || b.status === 'cancelled' ? (
                      <span className={`text-xs px-2 py-1 rounded-lg shrink-0 font-medium
                        ${b.status === 'completed' ? 'bg-stone-100 text-stone-600' : 'bg-red-50 text-red-400'}`}>
                        {STATUS_LABEL[b.status]}
                      </span>
                    ) : (
                      <select
                        value={b.status}
                        disabled={updating === b.id}
                        onChange={e => onStatusChange(b, e.target.value)}
                        className="text-xs border border-sand/30 rounded-lg px-2 py-1 outline-none focus:border-sand bg-white disabled:opacity-50 cursor-pointer shrink-0">
                        <option value="pending">รอยืนยัน</option>
                        <option value="confirmed">ยืนยัน</option>
                        <option value="completed">เสร็จสิ้น</option>
                        <option value="cancelled">ยกเลิก</option>
                      </select>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {allTimes.length === 0 ? (
        <div className="text-center py-20 text-site-gray text-sm">
          {loadingWeek ? 'กำลังโหลด...' : 'ไม่มีช่วงเวลาในสัปดาห์นี้'}
        </div>
      ) : (
        <>
          <div className={`overflow-x-auto rounded-2xl border border-sand/20 shadow-sm bg-white pb-3 transition-opacity ${loadingWeek ? 'opacity-50' : ''}`}>
            <table className="border-collapse text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-white border-b border-r border-sand/20 px-3 py-2 text-left font-medium text-site-gray min-w-[7rem]" />
                  {allTimes.map(time => (
                    <th key={time}
                      className="border-b border-sand/10 px-0 py-2 font-mono text-site-gray/50 font-normal text-center whitespace-nowrap min-w-[2.5rem]">
                      {fmt(time)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dates.map(date => (
                  <tr key={date} className={date === today ? 'bg-sand/5' : ''}>
                    <td
                      className={`sticky left-0 z-10 border-r border-sand/20 px-3 py-1.5 font-medium whitespace-nowrap text-xs cursor-pointer group select-none
                        ${date === today ? 'bg-sand/10 text-sand-deep hover:bg-sand/20' : 'bg-white text-site-dark hover:bg-stone-50'}`}
                      onClick={() => tryCloseDay(date)}
                      title="คลิกเพื่อปิดทั้งวัน">
                      {shortDate(date, today)}
                      <span className="ml-1 opacity-0 group-hover:opacity-30 transition-opacity text-stone-400">✕</span>
                    </td>
                    {buildRowCells(date)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {Object.entries(STATUS_LABEL).map(([status, label]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${LEGEND_BG[status]}`} />
                <span className="text-xs text-site-gray">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-stone-100" />
              <span className="text-xs text-site-gray">เวลาผ่านแล้ว / ปิด</span>
            </div>
          </div>
        </>
      )}

      {/* Detail modal */}
      {modalCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          onClick={() => setDetailCell(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-site-dark">
                  {shortDate(modalCell.slot.slot_date, today).replace(' ●', '')}
                  {' · '}{fmt(modalCell.slot.start_time)}–{fmt(modalCell.slot.end_time)}
                </p>
                <p className="text-xs text-site-gray mt-0.5">
                  ความจุ {modalCell.slot.capacity}
                  {' · '}{modalCell.bookings.filter(b => b.status !== 'cancelled').length} การจอง
                </p>
              </div>
              <button onClick={() => setDetailCell(null)}
                className="text-site-gray/40 hover:text-site-dark text-xl leading-none ml-4">✕</button>
            </div>
            {modalCell.bookings.length === 0 ? (
              <p className="text-sm text-site-gray/50 text-center py-6">ไม่มีการจอง</p>
            ) : (
              <div className="space-y-2.5">
                {modalCell.bookings.map(b => {
                  const name = b.profiles?.full_name ?? b.guest_name ?? '—'
                  const phone = b.profiles?.phone ?? b.guest_phone ?? ''
                  return (
                    <div key={b.id} className="border border-sand/20 rounded-xl p-3">
                      <div className="flex items-start gap-2 justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-site-dark text-sm">{name}</p>
                          {phone && <p className="text-xs text-site-gray">{phone}</p>}
                          <p className="text-xs text-site-gray mt-1">{b.services?.name} · {fmt(b.start_time)}–{fmt(b.end_time)}</p>
                          {b.note && <p className="text-xs text-site-gray/60 italic mt-0.5">{b.note}</p>}
                          <p className="text-xs text-site-gray/40 font-mono mt-1">{b.booking_no}</p>
                        </div>
                        {b.status === 'completed' || b.status === 'cancelled' ? (
                          <span className={`text-xs px-2 py-1 rounded-lg shrink-0 font-medium
                            ${b.status === 'completed' ? 'bg-stone-100 text-stone-600' : 'bg-red-50 text-red-400'}`}>
                            {STATUS_LABEL[b.status]}
                          </span>
                        ) : (
                          <select
                            value={b.status}
                            disabled={updating === b.id}
                            onChange={e => onStatusChange(b, e.target.value)}
                            className="text-xs border border-sand/30 rounded-lg px-2 py-1 outline-none focus:border-sand bg-white disabled:opacity-50 cursor-pointer shrink-0">
                            <option value="pending">รอยืนยัน</option>
                            <option value="confirmed">ยืนยัน</option>
                            <option value="completed">เสร็จสิ้น</option>
                            <option value="cancelled">ยกเลิก</option>
                          </select>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion time modal */}
      {completingBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40"
          onClick={() => setCompletingBooking(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5"
            onClick={e => e.stopPropagation()}>
            <p className="font-semibold text-site-dark mb-1">เลือกเวลาเสร็จสิ้น</p>
            <p className="text-xs text-site-gray mb-4">
              {completingBooking.profiles?.full_name ?? completingBooking.guest_name ?? '—'}
              {' · '}{fmt(completingBooking.start_time)}–{fmt(completingBooking.end_time)} (เดิม)
            </p>
            <label className="text-xs text-site-gray mb-1 block">เสร็จสิ้นเวลา</label>
            <select
              value={completionEndTime}
              onChange={e => setCompletionEndTime(e.target.value)}
              className="w-full text-sm border border-sand/30 rounded-xl px-3 py-2 outline-none focus:border-sand bg-white mb-3">
              {completionTimeOptions(completingBooking).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {completionEndTime && (
              <p className="text-xs text-site-gray mb-4">
                <span className="text-stone-600 font-medium">{fmt(completingBooking.start_time)}–{completionEndTime}</span>
                {' '}จะกลายเป็นเสร็จสิ้น
                {completionEndTime !== fmt(completingBooking.end_time) && (
                  <span className="text-green-600"> · {completionEndTime}–{fmt(completingBooking.end_time)} จะถูกปล่อยว่าง</span>
                )}
              </p>
            )}
            <div className="flex gap-2">
              <button onClick={() => setCompletingBooking(null)}
                className="flex-1 text-xs border border-sand/20 rounded-xl py-2 text-site-gray hover:border-sand transition-colors">
                ยกเลิก
              </button>
              <button onClick={completeBooking} disabled={completing || !completionEndTime}
                className="flex-1 text-xs bg-stone-600 text-white rounded-xl py-2 hover:bg-stone-700 transition-colors disabled:opacity-40">
                {completing ? 'กำลังบันทึก...' : 'ยืนยันเสร็จสิ้น'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close-day modal */}
      {closingDay && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setClosingDay(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5"
            onClick={e => e.stopPropagation()}>
            {closingDayHasActive ? (
              <>
                <p className="font-semibold text-site-dark mb-2">ไม่สามารถปิดได้</p>
                <p className="text-xs text-site-gray mb-3">
                  <span className="font-medium">{shortDate(closingDay, today).replace(' ●', '')}</span>
                  {' '}มีการจองที่รอยืนยันหรือยืนยันแล้วอยู่
                </p>
                <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 mb-5">
                  กรุณายกเลิกการจองทุกรายการด้วยตัวเองก่อน แล้วค่อยปิดวันนี้
                </p>
                <button onClick={() => setClosingDay(null)}
                  className="w-full text-sm bg-sand text-white rounded-xl py-2 hover:bg-sand-deep transition-colors">
                  ตกลง
                </button>
              </>
            ) : (
              <>
                <p className="font-semibold text-site-dark mb-1">ปิดทั้งวัน?</p>
                <p className="text-xs text-site-gray mb-3">
                  <span className="font-medium">{shortDate(closingDay, today).replace(' ●', '')}</span>
                </p>
                <p className="text-xs text-site-gray bg-stone-50 rounded-xl px-3 py-2 mb-5">
                  ทุก slot ที่ยังไม่เสร็จสิ้นจะถูกปิด ลูกค้าจะไม่สามารถจองวันนี้ได้
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setClosingDay(null)}
                    className="flex-1 text-xs border border-sand/20 rounded-xl py-2 text-site-gray hover:border-sand transition-colors">
                    ยกเลิก
                  </button>
                  <button onClick={confirmCloseDay} disabled={closingDayLoading}
                    className="flex-1 text-xs bg-stone-600 text-white rounded-xl py-2 hover:bg-stone-700 transition-colors disabled:opacity-40">
                    {closingDayLoading ? 'กำลังปิด...' : 'ยืนยันปิดทั้งวัน'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setCancellingBooking(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5"
            onClick={e => e.stopPropagation()}>
            <p className="font-semibold text-site-dark mb-1">ยืนยันการยกเลิกการจอง?</p>
            <p className="text-xs text-site-gray mb-4">
              {cancellingBooking.profiles?.full_name ?? cancellingBooking.guest_name ?? '—'}
              {' · '}{cancellingBooking.services?.name}
              {' · '}{fmt(cancellingBooking.start_time)}–{fmt(cancellingBooking.end_time)}
            </p>
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 mb-5">
              ไม่สามารถเปลี่ยนสถานะกลับได้อีก และ slot จะว่างทันที
            </p>
            <div className="flex gap-2">
              <button onClick={() => setCancellingBooking(null)}
                className="flex-1 text-xs border border-sand/20 rounded-xl py-2 text-site-gray hover:border-sand transition-colors">
                ปิด
              </button>
              <button onClick={confirmCancel} disabled={cancelling}
                className="flex-1 text-xs bg-red-500 text-white rounded-xl py-2 hover:bg-red-600 transition-colors disabled:opacity-40">
                {cancelling ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create booking modal */}
      {createSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          onClick={() => setCreateSlot(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-site-dark">
                  {shortDate(createSlot.slot_date, today).replace(' ●', '')} · {fmt(createSlot.start_time)}
                </p>
                <p className="text-xs text-site-gray mt-0.5">สร้างการจองสำหรับลูกค้า walk-in / call-in</p>
              </div>
              <button onClick={() => setCreateSlot(null)}
                className="text-site-gray/40 hover:text-site-dark text-xl leading-none ml-4">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-site-gray mb-1 block">บริการ</label>
                <select value={form.serviceId} onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))}
                  className="w-full text-sm border border-sand/30 rounded-xl px-3 py-2 outline-none focus:border-sand bg-white">
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} นาที)</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-site-gray mb-1 block">ชื่อลูกค้า *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="ชื่อ-นามสกุล"
                  className="w-full text-sm border border-sand/30 rounded-xl px-3 py-2 outline-none focus:border-sand" />
              </div>
              <div>
                <label className="text-xs text-site-gray mb-1 block">เบอร์โทร</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="0812345678"
                  className="w-full text-sm border border-sand/30 rounded-xl px-3 py-2 outline-none focus:border-sand" />
              </div>
              <div>
                <label className="text-xs text-site-gray mb-1 block">หมายเหตุ</label>
                <input type="text" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="ต้องการพิเศษ..."
                  className="w-full text-sm border border-sand/30 rounded-xl px-3 py-2 outline-none focus:border-sand" />
              </div>
              <div>
                <label className="text-xs text-site-gray mb-1 block">สถานะ</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full text-sm border border-sand/30 rounded-xl px-3 py-2 outline-none focus:border-sand bg-white">
                  <option value="confirmed">ยืนยันแล้ว</option>
                  <option value="pending">รอยืนยัน</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button onClick={() => blockSlot(createSlot.id)}
                className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 rounded-xl px-3 py-2 transition-colors">
                ปิด slot นี้
              </button>
              <div className="flex-1" />
              <button onClick={() => setCreateSlot(null)}
                className="text-xs text-site-gray border border-sand/20 rounded-xl px-4 py-2 hover:border-sand transition-colors">
                ยกเลิก
              </button>
              <button onClick={createBooking} disabled={creating || !form.name.trim() || !form.serviceId}
                className="text-xs bg-sand text-white rounded-xl px-4 py-2 hover:bg-sand-deep transition-colors disabled:opacity-40">
                {creating ? 'กำลังบันทึก...' : 'จอง →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
