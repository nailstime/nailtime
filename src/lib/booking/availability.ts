import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const SLOT_MINUTES = 15

type Slot = Database['public']['Tables']['time_slots']['Row']
type Service = Pick<Database['public']['Tables']['services']['Row'], 'id' | 'duration'>

type BookingRange = {
  services: { duration: number } | null
  time_slots: { start_time: string } | null
}

export type BookableSlot = Pick<Slot, 'id' | 'slot_date' | 'start_time' | 'capacity'> & {
  end_time: string
  booked_count: number
  available: number
  required_slot_ids: string[]
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`
}

function getBangkokNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  }
}

function getMinimumStartMinutes(date: string) {
  const now = getBangkokNow()
  if (date !== now.date) return null

  return Math.ceil(now.minutes / SLOT_MINUTES) * SLOT_MINUTES
}

function slotCountForDuration(duration: number) {
  return Math.max(1, Math.ceil(duration / SLOT_MINUTES))
}

function buildOccupiedCounts(bookings: BookingRange[]) {
  return bookings.reduce<Record<number, number>>((acc, booking) => {
    if (!booking.services || !booking.time_slots) return acc

    const start = timeToMinutes(booking.time_slots.start_time)
    const slotCount = slotCountForDuration(booking.services.duration)

    for (let index = 0; index < slotCount; index += 1) {
      const minute = start + index * SLOT_MINUTES
      acc[minute] = (acc[minute] ?? 0) + 1
    }

    return acc
  }, {})
}

export async function getBookableSlots(
  supabase: SupabaseClient<Database>,
  date: string,
  serviceId: string
) {
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, duration')
    .eq('id', serviceId)
    .eq('is_active', true)
    .single()

  if (serviceError || !service) {
    return { data: null, error: serviceError ?? new Error('Service not found') }
  }

  return getBookableSlotsForDuration(supabase, date, (service as Service).duration)
}

export async function getBookableSlotsForServices(
  supabase: SupabaseClient<Database>,
  date: string,
  serviceIds: string[]
) {
  const uniqueServiceIds = Array.from(new Set(serviceIds.filter(Boolean)))

  if (uniqueServiceIds.length === 0) {
    return { data: null, error: new Error('At least one service is required') }
  }

  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, duration')
    .in('id', uniqueServiceIds)
    .eq('is_active', true)

  if (servicesError) return { data: null, error: servicesError }
  if (!services || services.length !== uniqueServiceIds.length) {
    return { data: null, error: new Error('One or more services were not found') }
  }

  const totalDuration = (services as Service[]).reduce((total, service) => total + service.duration, 0)
  return getBookableSlotsForDuration(supabase, date, totalDuration)
}

export async function getBookableSlotsForDuration(
  supabase: SupabaseClient<Database>,
  date: string,
  duration: number
) {
  const { data: slots, error: slotsError } = await supabase
    .from('time_slots')
    .select('id, slot_date, start_time, end_time, capacity, is_active, created_at')
    .eq('slot_date', date)
    .eq('is_active', true)
    .order('start_time')

  if (slotsError) return { data: null, error: slotsError }

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('services(duration), time_slots!inner(slot_date, start_time)')
    .in('status', ['pending', 'confirmed'])
    .eq('time_slots.slot_date', date)

  if (bookingsError) return { data: null, error: bookingsError }

  const slotRows = (slots ?? []) as Slot[]
  const occupiedCounts = buildOccupiedCounts((bookings ?? []) as unknown as BookingRange[])
  const slotMap = new Map(slotRows.map(slot => [timeToMinutes(slot.start_time), slot]))
  const requiredCount = slotCountForDuration(duration)
  const minimumStartMinutes = getMinimumStartMinutes(date)

  const bookableSlots = slotRows.reduce<BookableSlot[]>((acc, slot) => {
    const start = timeToMinutes(slot.start_time)
    if (minimumStartMinutes !== null && start < minimumStartMinutes) return acc

    const requiredSlots = Array.from({ length: requiredCount }, (_, index) => {
      return slotMap.get(start + index * SLOT_MINUTES)
    })

    if (requiredSlots.some(requiredSlot => !requiredSlot)) return acc

    const remainingBySlot = requiredSlots.map(requiredSlot => {
      const minute = timeToMinutes(requiredSlot!.start_time)
      return requiredSlot!.capacity - (occupiedCounts[minute] ?? 0)
    })

    const available = Math.min(...remainingBySlot)
    if (available <= 0) return acc

    acc.push({
      id: slot.id,
      slot_date: slot.slot_date,
      start_time: slot.start_time,
      end_time: minutesToTime(start + requiredCount * SLOT_MINUTES),
      capacity: slot.capacity,
      booked_count: slot.capacity - available,
      available,
      required_slot_ids: requiredSlots.map(requiredSlot => requiredSlot!.id),
    })

    return acc
  }, [])

  return { data: bookableSlots, error: null }
}

export async function getAllSlotsWithAvailability(
  supabase: SupabaseClient<Database>,
  date: string,
  duration: number
) {
  const { data: slots, error: slotsError } = await supabase
    .from('time_slots')
    .select('id, slot_date, start_time, end_time, capacity, is_active, created_at')
    .eq('slot_date', date)
    .eq('is_active', true)
    .order('start_time')

  if (slotsError) return { data: null, error: slotsError }

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('services(duration), time_slots!inner(slot_date, start_time)')
    .in('status', ['pending', 'confirmed'])
    .eq('time_slots.slot_date', date)

  if (bookingsError) return { data: null, error: bookingsError }

  const slotRows = (slots ?? []) as Slot[]
  const occupiedCounts = buildOccupiedCounts((bookings ?? []) as unknown as BookingRange[])
  const slotMap = new Map(slotRows.map(slot => [timeToMinutes(slot.start_time), slot]))
  const requiredCount = slotCountForDuration(duration)
  const minimumStartMinutes = getMinimumStartMinutes(date)

  const result = slotRows.map(slot => {
    const start = timeToMinutes(slot.start_time)
    const isPast = minimumStartMinutes !== null && start < minimumStartMinutes

    const requiredSlots = Array.from({ length: requiredCount }, (_, index) =>
      slotMap.get(start + index * SLOT_MINUTES)
    )
    const allExist = requiredSlots.every(s => s != null)

    let available = 0
    if (!isPast && allExist) {
      const remaining = requiredSlots.map(s => {
        const minute = timeToMinutes(s!.start_time)
        return s!.capacity - (occupiedCounts[minute] ?? 0)
      })
      available = Math.max(0, Math.min(...remaining))
    }

    return {
      id: slot.id,
      slot_date: slot.slot_date,
      start_time: slot.start_time,
      end_time: minutesToTime(start + requiredCount * SLOT_MINUTES),
      capacity: slot.capacity,
      booked_count: slot.capacity - available,
      available,
      required_slot_ids: allExist ? requiredSlots.map(s => s!.id) : [],
    }
  })

  return { data: result, error: null }
}
