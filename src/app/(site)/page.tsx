import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { EditorialHome } from '@/components/site/EditorialHome'
export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('seo_settings').select('*').eq('page_key', 'home').single()
    const seo = data as { title: string; description: string; keywords: string; og_title: string; og_description: string; og_image: string } | null
    return {
      title: seo?.title ?? 'Nail Time & Spa ネイルタイム — ดอนหัวฬอ ชลบุรี',
      description: seo?.description ?? 'ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น ดอนหัวฬอ ชลบุรี',
      keywords: seo?.keywords ?? 'ร้านทำเล็บ,เล็บเจล,ดอนหัวฬอ,ชลบุรี',
      openGraph: {
        title: seo?.og_title ?? seo?.title ?? 'Nail Time & Spa ネイルタイム',
        description: seo?.og_description ?? seo?.description ?? undefined,
        images: seo?.og_image ? [seo.og_image] : ['/images/og_image.jpg'],
      },
    }
  } catch {
    return { title: 'Nail Time & Spa ネイルタイム — ดอนหัวฬอ ชลบุรี' }
  }
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.from('services')
    .select('id, name, description, duration, price')
    .eq('is_active', true).order('sort_order')
  const services = (data ?? []) as {
    id: string; name: string; description: string | null; duration: number; price: number | null
  }[]
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'NailSalon', name: 'Nail Time & Spa',
      url: 'https://nailtimebytt.com', telephone: '+660647451946',
      image: 'https://nailtimebytt.com/images/og_image.jpg',
      address: { '@type': 'PostalAddress', streetAddress: 'ตรงข้ามที่ทำการเทศบาล ดอนหัวฬอ',
        addressLocality: 'เมืองชลบุรี', addressRegion: 'ชลบุรี', postalCode: '20000', addressCountry: 'TH' },
      openingHours: 'Mo-Su 09:00-19:00', priceRange: '฿฿'
    }) }} />
    <EditorialHome services={services} />
  </>
}