import { createClient } from '@/lib/supabase/server'
import ServicesClient from './ServicesClient'

export default async function AdminServicesPage() {
  const supabase = await createClient()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('sort_order')
    .order('created_at')

  return <ServicesClient services={services ?? []} />
}
