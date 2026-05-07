'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Check, ChevronDown, Clock, Scissors } from 'lucide-react'

type Service = {
  id: string
  name: string
  duration: number
  price: number | null
}

type Slot = {
  id: string
  slot_date: string
  start_time: string
  end_time: string
  available: number
}

function getDates(days = 21) {
  const result: string[] = []
  const today = new Date()

  for (let index = 0; index < days; index += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() + index)
    result.push(formatDateValue(date))
  }

  return result
}

function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('th-TH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function HomeBookingBar() {
  const dates = useMemo(() => getDates(), [])
  const [services, setServices] = useState<Service[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [openPanel, setOpenPanel] = useState<'services' | 'date' | 'time' | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [mounted, setMounted] = useState(false)

  const selectedServices = services.filter(service => selectedServiceIds.includes(service.id))
  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0)
  const selectedServiceLabel = selectedServices.length === 0
    ? 'เลือกบริการ'
    : selectedServices.length === 1
      ? selectedServices[0].name
      : `${selectedServices.length} บริการ`
  const bookingHref = selectedServices.length > 0 && selectedDate && selectedSlot
    ? `/booking?services=${selectedServiceIds.join(',')}&date=${selectedDate}&slot=${selectedSlot.id}`
    : '/booking'

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    function onSelectService(e: Event) {
      const id = (e as CustomEvent<{ id: string }>).detail.id
      setSelectedServiceIds([id])
      setSelectedDate('')
      setSelectedSlot(null)
      setSlots([])
      setOpenPanel('date')
    }
    function onOpenServicesPanel() {
      setOpenPanel('services')
    }
    window.addEventListener('select-service', onSelectService)
    window.addEventListener('open-services-panel', onOpenServicesPanel)
    return () => {
      window.removeEventListener('select-service', onSelectService)
      window.removeEventListener('open-services-panel', onOpenServicesPanel)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    if (selectedServiceIds.length === 0 || !selectedDate) {
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams({
      date: selectedDate,
      service_ids: selectedServiceIds.join(','),
      show_all: '1',
    })

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingSlots(true)

    fetch(`/api/slots?${params.toString()}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setSlots(Array.isArray(data) ? data : []))
      .catch(error => {
        if (error.name !== 'AbortError') setSlots([])
      })
      .finally(() => setLoadingSlots(false))

    return () => controller.abort()
  }, [mounted, selectedDate, selectedServiceIds])

  function toggleService(id: string) {
    setSelectedSlot(null)
    setSlots([])
    setSelectedServiceIds(current => {
      const next = current.includes(id)
        ? current.filter(serviceId => serviceId !== id)
        : [...current, id]
      return next
    })
  }

  if (!mounted) {
    return (
      <div className="relative z-30 bg-sand px-4 md:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-0 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center md:min-h-[90px]">
          {[
            ['บริการ', 'เลือกบริการ'],
            ['วันที่', 'เลือกวันที่'],
            ['เวลา', 'เลือกเวลา'],
          ].map(([label, value]) => (
            <div key={label} className="border-b border-white/20 md:border-b-0 md:border-r md:border-white/30">
              <div className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left md:px-6">
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/70">{label}</span>
                  <span className="truncate text-sm font-medium text-white">{value}</span>
                </span>
              </div>
            </div>
          ))}
          <div className="flex items-center px-4 pb-4 md:px-0 md:pb-0 md:pl-6">
            <span className="inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3 text-xs font-medium tracking-widest text-sand-deep uppercase opacity-60 md:w-auto">
              จองนัด
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="book" className="relative z-30 bg-sand px-4 md:px-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-0 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center md:min-h-[90px]">
        <div className="relative border-b border-white/20 md:border-b-0 md:border-r md:border-white/30">
          <button
            type="button"
            onClick={() => setOpenPanel(openPanel === 'services' ? null : 'services')}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left md:px-6"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/70">บริการ</span>
              <span className="truncate text-sm font-medium text-white">{selectedServiceLabel}</span>
              {totalDuration > 0 && <span className="text-[11px] text-white/70">{totalDuration} นาที</span>}
            </span>
            <ChevronDown size={17} className="shrink-0 text-white/80" />
          </button>

          {openPanel === 'services' && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-sand/20 bg-white p-2 shadow-xl md:left-4 md:right-4">
              {services.map(service => {
                const selected = selectedServiceIds.includes(service.id)
                return (
                  <button
                    type="button"
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors ${selected ? 'bg-sand/10' : 'hover:bg-cream'}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-site-dark">{service.name}</span>
                      <span className="block text-xs text-site-gray">{service.duration} นาที{service.price ? ` · ${service.price.toLocaleString()} บาท` : ''}</span>
                    </span>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-sand bg-sand text-white' : 'border-sand/30 text-transparent'}`}>
                      <Check size={13} />
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="relative border-b border-white/20 md:border-b-0 md:border-r md:border-white/30">
          <button
            type="button"
            onClick={() => setOpenPanel(openPanel === 'date' ? null : 'date')}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left md:px-6"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/70">วันที่</span>
              <span className="truncate text-sm font-medium text-white">{selectedDate ? formatDate(selectedDate) : 'เลือกวันที่'}</span>
            </span>
            <CalendarDays size={17} className="shrink-0 text-white/80" />
          </button>

          {openPanel === 'date' && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 grid max-h-80 grid-cols-3 gap-2 overflow-y-auto rounded-2xl border border-sand/20 bg-white p-3 shadow-xl md:left-4 md:right-4">
              {dates.map(date => (
                <button
                  type="button"
                  key={date}
                  onClick={() => {
                    setSelectedDate(date)
                    setSelectedSlot(null)
                    setSlots([])
                    setOpenPanel('time')
                  }}
                  className={`rounded-xl px-3 py-3 text-center text-sm transition-colors ${selectedDate === date ? 'bg-sand text-white' : 'bg-cream text-site-dark hover:bg-sand/10'}`}
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            disabled={selectedServiceIds.length === 0 || !selectedDate}
            onClick={() => setOpenPanel(openPanel === 'time' ? null : 'time')}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left disabled:opacity-55 md:px-6"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/70">เวลา</span>
              <span className="truncate text-sm font-medium text-white">
                {selectedSlot ? `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}` : 'เลือกเวลา'}
              </span>
            </span>
            <Clock size={17} className="shrink-0 text-white/80" />
          </button>

          {openPanel === 'time' && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-sand/20 bg-white p-3 shadow-xl md:left-4 md:right-4">
              {loadingSlots ? (
                <p className="py-6 text-center text-sm text-site-gray">กำลังโหลดเวลา...</p>
              ) : slots.length === 0 ? (
                <p className="py-6 text-center text-sm text-site-gray">ไม่มีเวลาที่พอสำหรับบริการที่เลือก</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map(slot => {
                    const bookable = slot.available > 0
                    const isSelected = selectedSlot?.id === slot.id
                    return (
                      <button
                        type="button"
                        key={slot.id}
                        disabled={!bookable}
                        onClick={() => {
                          setSelectedSlot(slot)
                          setOpenPanel(null)
                        }}
                        className={`rounded-xl px-3 py-3 text-center text-sm font-semibold transition-colors
                          ${isSelected ? 'bg-sand text-white' : bookable ? 'bg-cream text-site-dark hover:bg-sand/10' : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}
                      >
                        {formatTime(slot.start_time)}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center px-4 pb-4 md:px-0 md:pb-0 md:pl-6">
          <Link
            href={bookingHref}
            aria-disabled={!selectedSlot}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-xs font-medium tracking-widest text-sand-deep uppercase transition-all md:w-auto ${selectedSlot ? 'hover:bg-cream hover:scale-105 active:scale-95' : 'pointer-events-none opacity-60'}`}
          >
            <Scissors size={14} />
            จองนัด
          </Link>
        </div>
      </div>
    </div>
  )
}
