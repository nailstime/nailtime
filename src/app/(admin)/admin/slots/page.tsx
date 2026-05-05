import { createClient } from '@/lib/supabase/server'
import SlotsClient from './SlotsClient'

export default async function AdminSlotsPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: slots } = await supabase
    .from('time_slots')
    .select('*')
    .gte('slot_date', today)
    .order('slot_date')
    .order('start_time')
    .limit(200)

  return <SlotsClient slots={slots ?? []} />
}
