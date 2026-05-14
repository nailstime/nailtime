import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Reveal, StaggerParent, StaggerChild } from '@/components/ui/Reveal'
import { DrawLine } from '@/components/ui/DrawLine'
import { HeroSection } from '@/components/sections/HeroSection'
import { FloatingCTA } from '@/components/layout/FloatingCTA'
import { HomeBookingBar } from '@/components/booking/HomeBookingBar'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { LineCouponForm } from '@/components/sections/LineCouponForm'
import { Hand, Lightbulb, Paintbrush } from 'lucide-react'

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
        images: seo?.og_image ? [seo.og_image] : [],
      },
    }
  } catch {
    return { title: 'Nail Time & Spa ネイルタイム — ดอนหัวฬอ ชลบุรี' }
  }
}

const REVIEWS = [
  {
    name: 'คุณนุ่น',
    date: 'เมษายน 2026',
    text: 'ทำเล็บสวยมากค่ะ ช่างใจเย็น พูดคุยง่าย สีออกมาตรงใจเลย ครั้งหน้าจะมาอีกแน่นอน ❤️',
  },
  {
    name: 'คุณแอน',
    date: 'มีนาคม 2026',
    text: 'ร้านสะอาดมาก อุปกรณ์ใหม่เอี่ยม เล็บอยู่ทนมากกว่า 3 สัปดาห์ ไม่หลุดเลยค่ะ แนะนำเลย',
  },
  {
    name: 'คุณฝน',
    date: 'กุมภาพันธ์ 2026',
    text: 'มาทำทั้งมือและเท้า ช่างฝีมือดีมาก ลายที่ขอมาออกมาสวยเกินคาด ประทับใจมากๆ ค่ะ',
  },
]

const featureServices = [
  { title: 'Nail Care', icon: Hand, desc: 'ดูแลเล็บมือเท้าครบครัน ทำความสะอาด ตกแต่งผิว' },
  { title: 'Nail Art', icon: Paintbrush, desc: 'เพ้นท์ลายอิสระ สไตล์ญี่ปุ่น ลาย custom ทุกแบบ' },
  { title: 'Tips & Trends', icon: Lightbulb, desc: 'อัพเดตเทรนด์ใหม่ แนะนำสีและลาย เปลี่ยนทุกซีซั่น' },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: dbServices } = await supabase
    .from('services')
    .select('id, name, description, duration, price')
    .eq('is_active', true)
    .order('sort_order')

  const services = (dbServices ?? []) as {
    id: string; name: string; description: string | null; duration: number; price: number | null
  }[]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NailSalon',
            name: 'Nail Time & Spa ネイルタイム',
            image: 'https://nailtimebytt.com/og.jpg',
            url: 'https://nailtimebytt.com',
            telephone: '+660647451946',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'ตรงข้ามที่ทำการเทศบาล ดอนหัวฬอ',
              addressLocality: 'เมืองชลบุรี',
              addressRegion: 'ชลบุรี',
              postalCode: '20000',
              addressCountry: 'TH',
            },
            openingHoursSpecification: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
              opens: '09:00',
              closes: '19:00',
            },
            sameAs: [
              'https://www.facebook.com/p/Nail-Time-Spa-%E3%83%8D%E3%82%A4%E3%83%AB%E3%82%BF%E3%82%A4%E3%83%A0-100065117245969/',
              'https://www.instagram.com/nail_time_bytt',
            ],
            priceRange: '฿฿',
            currenciesAccepted: 'THB',
            paymentAccepted: 'Cash, PromptPay',
          }),
        }}
      />
      <Header />
      <FloatingCTA />

      {/* HERO */}
      <HeroSection />

      {/* BOOKING BAR */}
      <HomeBookingBar />

      {/* FEATURES */}
      <section id="services" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand mb-3">What We Do</p>
            <h2 className="text-4xl font-bold text-site-dark inline-block relative">
              บริการของเรา
              <DrawLine className="w-32 mx-auto mt-2" />
            </h2>
          </Reveal>
          <StaggerParent className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {featureServices.map(({ icon: Icon, ...f }) => (
              <StaggerChild key={f.title}>
                <div className="group cursor-default">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full border border-sand/40 flex items-center justify-center group-hover:border-sand group-hover:bg-sand/5 transition-all duration-300">
                    <Icon size={28} strokeWidth={1.5} className="text-sand transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-sand transition-colors duration-300">{f.title}</h3>
                  <p className="text-sm text-site-gray leading-relaxed">{f.desc}</p>
                </div>
              </StaggerChild>
            ))}
          </StaggerParent>
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="grid grid-cols-1 md:grid-cols-2 min-h-[560px]">
        <div className="relative bg-[#e0d0ba] overflow-hidden min-h-[320px]">
          <Reveal y={0} delay={0} className="absolute left-16 top-10 w-[260px] bottom-10">
            <div className="w-full h-full rounded-[100px_100px_0_0] bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800')] bg-center bg-cover shadow-2xl" />
          </Reveal>
          <Reveal y={20} delay={0.15} className="absolute right-10 bottom-14 w-[180px] h-[260px]">
            <div className="w-full h-full rounded-[100px_100px_0_0] bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600')] bg-top bg-cover shadow-[-20px_-20px_30px_rgba(0,0,0,0.16)]" />
          </Reveal>
        </div>
        <div className="flex flex-col justify-center px-10 md:px-16 py-16 bg-cream gap-4">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand">Our Story</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl font-bold">
              เกี่ยวกับร้านของเรา
              <DrawLine className="w-40 mt-2" delay={0.6} />
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-sm text-site-gray leading-relaxed">
              ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บเจล อะคีลิก PVC และสปามือเท้า
              ตั้งอยู่ที่ดอนหัวฬอ ชลบุรี ตรงข้ามที่ทำการเทศบาล
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-sm text-site-gray leading-relaxed">
              เราเน้นสไตล์ญี่ปุ่น ใช้วัสดุนำเข้าคุณภาพสูง ไม่แพ้ผิว ช่างมืออาชีพ ใส่ใจทุกรายละเอียด
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <ul className="flex flex-col gap-2 my-2 text-sm text-site-gray">
              <li><strong className="text-site-dark">Always Clean</strong> — อุปกรณ์สะอาด ปลอดภัยทุกครั้ง</li>
              <li><strong className="text-site-dark">Always Leading</strong> — ตามเทรนด์ญี่ปุ่น อัพเดตทุกซีซั่น</li>
            </ul>
          </Reveal>
          <Reveal delay={0.5}>
            <a href="https://www.facebook.com/p/Nail-Time-Spa-%E3%83%8D%E3%82%A4%E3%83%AB%E3%82%BF%E3%82%A4%E3%83%A0-100065117245969/"
              target="_blank" rel="noopener"
              className="self-start rounded-full border border-site-dark text-xs font-medium uppercase tracking-widest px-7 py-3 hover:bg-site-dark hover:text-white transition-all active:scale-95">
              ดูเพจ Facebook →
            </a>
          </Reveal>
        </div>
      </section>

      {/* MIX & MATCH POLISHES */}
      <section className="bg-sand py-24 px-10 overflow-hidden">
        <Reveal>
          <h2 className="text-center text-2xl font-bold uppercase tracking-[0.1em] text-white mb-14">
            Mix &amp; Match Polishes
          </h2>
        </Reveal>
        <StaggerParent className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { src: '/images/bottle-base.png',  name: 'Base Coat',    sub: 'Film shadow / No.5 oz' },
            { src: '/images/bottle-gel.png',   name: 'Gel Polish',   sub: 'Sorbet fine / No.5 oz' },
            { src: '/images/bottle-top.png',   name: 'Top Coat',     sub: 'Summer mirage / No.5 oz' },
            { src: '/images/bottle-matte.png', name: 'Matte Polish', sub: 'Blue Paletts / No.5 oz' },
          ].map(b => (
            <StaggerChild key={b.name}>
              <div className="text-center group">
                <div className="overflow-visible pt-4">
                  <Image src={b.src} alt={b.name} width={100} height={220}
                    className="mx-auto mb-5 object-contain drop-shadow-[-16px_-6px_20px_rgba(0,0,0,0.18)] group-hover:-translate-y-3 group-hover:drop-shadow-[-16px_-12px_28px_rgba(0,0,0,0.28)] transition-all duration-500"
                    style={{ height: 220, width: 'auto' }} />
                </div>
                <p className="text-sm font-semibold text-white">{b.name}</p>
                <p className="text-xs text-white/70 mt-1">{b.sub}</p>
              </div>
            </StaggerChild>
          ))}
        </StaggerParent>
      </section>

      {/* TREATMENTS & PRICES */}
      <section id="prices" className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
        <div className="flex flex-col justify-center px-10 md:px-16 py-16 bg-cream gap-6">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand">Treatments &amp; Prices</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl font-bold">
              บริการและราคา
              <DrawLine className="w-36 mt-2" delay={0.5} />
            </h2>
          </Reveal>
          <ServicesSection services={services} />
          <Reveal delay={0.2}>
            <a href="tel:0647451946"
              className="self-start rounded-full border border-site-dark text-xs font-medium uppercase tracking-widest px-7 py-3 hover:bg-site-dark hover:text-white transition-all active:scale-95">
              โทรสอบถามราคา
            </a>
          </Reveal>
        </div>
        <div className="hidden md:block bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1000')] bg-center bg-cover min-h-[400px]" />
      </section>

      {/* GALLERY */}
      <section id="products" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand mb-2">Our Work</p>
            <h2 className="text-4xl font-bold text-site-dark">
              ผลงานของเรา
              <DrawLine className="w-32 mx-auto mt-2" delay={0.4} />
            </h2>
          </Reveal>
          <StaggerParent className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
              'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=600&q=80',
              'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80&crop=faces',
              'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=600&q=80&crop=faces',
              'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80&flip=h',
              'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=600&q=80&flip=h',
            ].map((src, i) => (
              <StaggerChild key={i}>
                <div className="relative overflow-hidden rounded-xl aspect-square bg-cream group cursor-pointer">
                  <div className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${src})` }} />
                  <div className="absolute inset-0 bg-site-dark/0 group-hover:bg-site-dark/20 transition-all duration-300" />
                </div>
              </StaggerChild>
            ))}
          </StaggerParent>
          <Reveal delay={0.2} className="text-center mt-10">
            <a href="https://www.instagram.com/nail_time_bytt/" target="_blank" rel="noopener"
              className="inline-flex items-center gap-2 rounded-full border border-site-dark text-xs font-medium uppercase tracking-widest px-8 py-3 hover:bg-site-dark hover:text-white transition-all active:scale-95">
              ดูผลงานทั้งหมดบน Instagram →
            </a>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-cream">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand mb-3">Happy Clients</p>
            <h2 className="text-4xl font-bold text-site-dark inline-block">
              เสียงจากลูกค้า
              <DrawLine className="w-28 mx-auto mt-2" />
            </h2>
          </Reveal>
          <StaggerParent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <StaggerChild key={r.name}>
                <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(89,64,38,0.06)] flex flex-col gap-3 h-full">
                  <div className="flex gap-0.5 text-sand text-base">★★★★★</div>
                  <p className="text-sm text-site-gray leading-relaxed flex-1">"{r.text}"</p>
                  <div>
                    <p className="text-sm font-semibold text-site-dark">{r.name}</p>
                    <p className="text-[11px] text-site-gray mt-0.5">{r.date}</p>
                  </div>
                </div>
              </StaggerChild>
            ))}
          </StaggerParent>
        </div>
      </section>

      {/* INSTAGRAM CTA */}
      <section id="gallery" className="relative overflow-hidden">
        <div className="grid grid-cols-5 grid-rows-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-48"
              style={{ background: ['#d8b192','#c8a07a','#e0c8a8','#b89060','#d4b090','#c4a07a','#dcc0a0','#b89868','#d0b090','#c8a880'][i] }} />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <a href="https://www.instagram.com/nail_time_bytt/" target="_blank" rel="noopener"
            className="bg-cream shadow-2xl px-16 py-10 text-center flex flex-col items-center gap-2 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
            <svg className="w-10 h-10 text-sand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            <p className="text-3xl font-bold uppercase tracking-wider text-sand">Follow Us</p>
            <p className="text-sm text-site-gray">@nail_time_bytt</p>
          </a>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="grid grid-cols-1 md:grid-cols-2 min-h-[440px]">
        <div className="hidden md:block relative min-h-[400px]">
          <iframe
            src="https://maps.google.com/maps?q=C2CM%2BQW+Don+Hua+Lo,+Chon+Buri+District,+Chon+Buri&output=embed&hl=th&z=17"
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Nail Time Studio แผนที่"
          />
        </div>
        <div className="flex flex-col justify-center px-10 md:px-16 py-16 bg-cream gap-4">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand">Contact Our Salon</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl font-bold">ติดต่อร้านของเรา</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-xs uppercase tracking-widest text-site-gray mt-2">โทรนัดหมาย</p>
            <a href="tel:0647451946" className="text-3xl font-bold text-sand hover:text-sand-dark transition-colors">
              064 745 1946
            </a>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-col gap-3 text-sm text-site-gray">
              <div className="flex items-start gap-2">
                <span className="shrink-0">📍</span>
                <span>เทศบาลดอนหัวฬอ ชลบุรี<br />ตรงข้ามที่ทำการเทศบาล</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🕘</span>
                <span>เปิดทุกวัน <strong className="text-site-dark">09:00 – 19:00 น.</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span>📷</span>
                <a href="https://www.instagram.com/nail_time_bytt/" target="_blank" rel="noopener" className="text-sand hover:underline">@nail_time_bytt</a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <LineCouponForm />
          </Reveal>
          {/* Map on mobile */}
          <Reveal delay={0.5} className="block md:hidden">
            <div className="relative w-full h-56 rounded-xl overflow-hidden">
              <iframe
                src="https://maps.google.com/maps?q=C2CM%2BQW+Don+Hua+Lo,+Chon+Buri+District,+Chon+Buri&output=embed&hl=th&z=17"
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Nail Time Studio แผนที่"
              />
            </div>
          </Reveal>
          <Reveal delay={0.5}>
            <a
              href="https://maps.app.goo.gl/m6ivA9WGWFaRu6MRA"
              target="_blank"
              rel="noopener noreferrer"
              className="self-start rounded-full border border-site-dark text-xs font-medium uppercase tracking-widest px-7 py-3 hover:bg-site-dark hover:text-white transition-all active:scale-95"
            >
              เปิดใน Google Maps →
            </a>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-sand pt-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-14 pb-14">
          <div>
            <span className="font-bold text-xl text-white">Nail Time <span className="text-white/80">&amp; Spa</span></span>
            <p className="mt-4 text-sm text-white/80 leading-relaxed">ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น<br />ดอนหัวฬอ ชลบุรี</p>
            <div className="flex gap-3 mt-5">
              {[
                { href: 'https://www.instagram.com/nail_time_bytt/', label: 'IG' },
                { href: 'https://www.facebook.com/p/Nail-Time-Spa-%E3%83%8D%E3%82%A4%E3%83%AB%E3%82%BF%E3%82%A4%E3%83%A0-100065117245969/', label: 'FB' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener"
                  className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-xs text-white font-semibold hover:bg-white/20 hover:scale-110 transition-all">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-4">เมนู</h4>
            {[['/#services','บริการ'],['/#story','เกี่ยวกับ'],['/#products','ผลงาน'],['/booking','จองนัด']].map(([href,label]) => (
              href.startsWith('/#') ? (
                <a key={href} href={href} className="block text-sm text-white/75 mb-2 hover:text-white hover:translate-x-1 transition-all">{label}</a>
              ) : (
                <Link key={href} href={href} className="block text-sm text-white/75 mb-2 hover:text-white hover:translate-x-1 transition-all">{label}</Link>
              )
            ))}
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-4">ติดต่อ</h4>
            <p className="text-sm text-white/75 mb-2">064 745 1946</p>
            <p className="text-sm text-white/75 mb-2">เทศบาลดอนหัวฬอ ชลบุรี</p>
            <p className="text-sm text-white/75">ตรงข้ามที่ทำการเทศบาล</p>
          </div>
        </div>
        <div className="border-t border-white/15 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© 2026 Nail Time &amp; Spa ネイルタイム · ดอนหัวฬอ ชลบุรี</p>
          <p>เปิดทุกวัน 09:00 – 19:00 น.</p>
        </div>
      </footer>
    </>
  )
}
