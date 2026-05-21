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
        images: seo?.og_image ? [seo.og_image] : ['/images/og_image.jpg'],
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
      <section id="services" className="py-16 sm:py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand mb-3">What We Do</p>
            <h2 className="relative inline-block text-3xl font-bold text-site-dark sm:text-4xl">
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
      <section id="story" className="grid min-h-[640px] grid-cols-1 bg-[#dfceb7] md:grid-cols-[1.08fr_0.92fr]">
        <div className="relative min-h-[520px] overflow-hidden border-y border-site-dark/10 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.38),transparent_28%),linear-gradient(135deg,#e6d7c1_0%,#d8c4aa_100%)] sm:min-h-[620px]">
          <div className="absolute inset-x-8 top-8 h-px bg-site-dark/12" />
          <div className="absolute bottom-8 left-8 top-8 w-px bg-site-dark/12" />
          <div className="absolute bottom-8 right-8 top-8 w-px bg-white/25" />
          <div className="absolute left-[52%] top-16 hidden h-28 w-28 rounded-full border border-white/35 md:block" />
          <div className="absolute bottom-14 right-[24%] hidden h-20 w-20 rounded-full border border-site-dark/10 md:block" />
          <div className="absolute left-10 top-10 text-[10px] font-semibold uppercase tracking-[0.32em] text-site-dark/35 [writing-mode:vertical-rl]">Since 2019</div>
          {/* Main arch — left */}
          <Reveal y={0} delay={0} className="absolute bottom-10 left-[11%] top-12 w-[38%] min-w-[190px] max-w-[300px] sm:bottom-14 sm:top-14">
            <div className="relative h-full w-full rounded-[999px_999px_12px_12px] bg-[#efe4d5] p-2 shadow-[0_28px_70px_rgba(54,38,24,0.24)]">
              <div className="h-full w-full rounded-[999px_999px_8px_8px] bg-[url('/images/portfolio/1.webp')] bg-cover bg-center" />
              <div className="absolute -bottom-5 -right-5 h-20 w-20 border-b border-r border-site-dark/18" />
            </div>
          </Reveal>
          {/* Small arch — right bottom */}
          <Reveal y={20} delay={0.15} className="absolute bottom-14 right-[7%] h-[210px] w-[27%] min-w-[132px] max-w-[190px] sm:bottom-20 sm:h-[270px]">
            <div className="relative h-full w-full rounded-[999px_999px_10px_10px] bg-white/55 p-1.5 shadow-[-18px_22px_46px_rgba(54,38,24,0.2)]">
              <div className="h-full w-full rounded-[999px_999px_7px_7px] bg-[url('/images/portfolio/2.webp')] bg-cover bg-top" />
              <span className="absolute -left-12 top-12 h-px w-14 bg-site-dark/22" />
            </div>
          </Reveal>
          {/* Extra small arch — right top */}
          <Reveal y={-10} delay={0.25} className="absolute right-[11%] top-12 h-[145px] w-[22%] min-w-[104px] max-w-[150px] sm:top-16 sm:h-[185px]">
            <div className="relative h-full w-full rounded-[999px_999px_10px_10px] bg-white/50 p-1.5 shadow-[0_18px_36px_rgba(54,38,24,0.18)]">
              <div className="h-full w-full rounded-[999px_999px_7px_7px] bg-[url('/images/portfolio/6.webp')] bg-cover bg-center" />
            </div>
          </Reveal>
          {/* Center wording */}
          <Reveal delay={0.3} className="pointer-events-none absolute left-[37%] right-[23%] top-1/2 z-10 flex -translate-y-1/2 flex-col items-center text-center max-md:left-[24%] max-md:right-[24%]">
            <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.46em] text-site-dark/50 sm:text-sm">Nail time Story</p>
            <div className="mb-6 flex w-full max-w-[180px] items-center gap-4">
              <span className="h-px flex-1 bg-site-dark/25" />
              <span className="h-1.5 w-1.5 rounded-full bg-site-dark/38" />
              <span className="h-px flex-1 bg-site-dark/25" />
            </div>
            <p className="mb-4 whitespace-nowrap font-[family-name:var(--font-thai-modern)] text-4xl font-semibold leading-none text-site-dark drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] sm:text-[46px]">
              เรื่องราวของเรา
            </p>
            <p className="mb-3 whitespace-nowrap font-[family-name:var(--font-thai-modern)] text-sm font-normal leading-relaxed text-site-dark/64">
              ร้านเล็กๆ ที่ไม่เคยหยุดพัฒนา
            </p>
            <p className="max-w-[280px] font-[family-name:var(--font-thai-modern)] text-sm font-normal leading-relaxed text-site-dark/64">
              กับฝีมือและผลิตภัณฑ์ระดับพรีเมี่ยม
            </p>
          </Reveal>
        </div>
        <div className="flex flex-col justify-center gap-4 bg-cream px-6 py-12 sm:px-10 md:px-16 md:py-16">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand">Our Story</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl font-bold sm:text-4xl">
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
      <section className="overflow-hidden bg-sand px-4 py-16 sm:px-10 sm:py-20 md:py-24">
        <Reveal>
          <div className="flex flex-col items-center gap-3 mb-14">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase bg-white/30 text-site-dark px-4 py-1.5 rounded-full">
              GellyFit · Korea Professional
            </span>
            <h2 className="text-center text-2xl font-bold uppercase tracking-[0.1em] text-site-dark">
              Mix &amp; Match Polishes
            </h2>
            <p className="text-center text-sm text-site-dark/60">
              Combination สุดฮิตที่ร้านเลือกมาให้
            </p>
          </div>
        </Reveal>
        <StaggerParent className="mx-auto grid max-w-4xl grid-cols-2 gap-x-4 gap-y-10 sm:gap-8 md:grid-cols-4">
          {[
            { src: '/images/bottle-base.png',  name: 'Base Coat',    sub: 'Film shadow / No.5 oz' },
            { src: '/images/bottle-gel.png',   name: 'Gel Polish',   sub: 'Sorbet fine / No.5 oz' },
            { src: '/images/bottle-top.png',   name: 'Top Coat',     sub: 'Summer mirage / No.5 oz' },
            { src: '/images/bottle-matte.png', name: 'Matte Polish', sub: 'Blue Paletts / No.5 oz' },
          ].map(b => (
            <StaggerChild key={b.name}>
              <div className="text-center group">
                <div className="overflow-visible pt-4">
                  <Image src={b.src} alt={b.name} width={100} height={240}
                    className="mx-auto mb-6 object-contain drop-shadow-[-16px_-6px_20px_rgba(0,0,0,0.18)] group-hover:-translate-y-3 group-hover:drop-shadow-[-16px_-12px_28px_rgba(0,0,0,0.28)] transition-all duration-500"
                    style={{ height: 240, width: 'auto' }} />
                </div>
                <p className="text-sm font-bold text-white">{b.name}</p>
                <p className="text-xs text-white/70 mt-1">{b.sub}</p>
              </div>
            </StaggerChild>
          ))}
        </StaggerParent>
      </section>

      {/* TREATMENTS & PRICES */}
      <section id="prices" className="grid min-h-[500px] grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-center gap-6 bg-cream px-6 py-12 sm:px-10 md:px-16 md:py-16">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand">Treatments &amp; Prices</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl font-bold sm:text-4xl">
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
      <section id="products" className="bg-white py-16 sm:py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand mb-2">Our Work</p>
            <h2 className="text-3xl font-bold text-site-dark sm:text-4xl">
              ผลงานของเรา
              <DrawLine className="w-32 mx-auto mt-2" delay={0.4} />
            </h2>
          </Reveal>
          <StaggerParent className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              '/images/portfolio/1.webp',
              '/images/portfolio/2.webp',
              '/images/portfolio/3.webp',
              '/images/portfolio/4.webp',
              '/images/portfolio/5.webp',
              '/images/portfolio/6.webp',
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

      {/* CATALOG */}
      <section className="bg-site-dark py-10 overflow-hidden">
        <Reveal className="text-center mb-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand">Our Catalog Idea</p>
        </Reveal>
        <div className="relative">
          <div className="flex gap-3 animate-marquee w-max">
            {[...Array.from({length:11},(_,i)=>`/images/catalog/${i+1}.webp`),...Array.from({length:11},(_,i)=>`/images/catalog/${i+1}.webp`)].map((src,i)=>(
              <div key={i} className="shrink-0 w-40 h-40 sm:w-48 sm:h-48 rounded-xl overflow-hidden">
                <Image src={src} alt="" width={192} height={192} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-cream py-16 sm:py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand mb-3">Happy Clients</p>
            <h2 className="inline-block text-3xl font-bold text-site-dark sm:text-4xl">
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

      {/* SOCIAL CTA */}
      <section id="gallery" className="relative overflow-hidden">
        <div className="grid grid-cols-2 grid-rows-5 sm:grid-cols-5 sm:grid-rows-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-28 sm:h-48"
              style={{ background: ['#d8b192','#c8a07a','#e0c8a8','#b89060','#d4b090','#c4a07a','#dcc0a0','#b89868','#d0b090','#c8a880'][i] }} />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            {/* Instagram */}
            <a href="https://www.instagram.com/nail_time_bytt/" target="_blank" rel="noopener"
              className="flex flex-col items-center justify-center gap-3 bg-cream px-8 py-10 text-center shadow-2xl transition-all duration-300 hover:-translate-y-1 w-66 sm:w-72">
              <svg className="w-12 h-12 text-sand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              <p className="text-sm font-bold uppercase tracking-widest text-sand">Instagram</p>
              <p className="text-xs text-site-gray">@nail_time_bytt</p>
            </a>
            {/* Facebook */}
            <a href="https://www.facebook.com/p/Nail-Time-Spa-%E3%83%8D%E3%82%A4%E3%83%AB%E3%82%BF%E3%82%A4%E3%83%A0-100065117245969/" target="_blank" rel="noopener"
              className="flex flex-col items-center justify-center gap-3 bg-cream px-8 py-10 text-center shadow-2xl transition-all duration-300 hover:-translate-y-1 w-64 sm:w-72">
              <svg className="w-12 h-12 text-sand" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <p className="text-sm font-bold uppercase tracking-widest text-sand">Facebook</p>
              <p className="text-xs text-site-gray">Nail Time &amp; Spa</p>
            </a>
            {/* LINE */}
            <a href="https://line.me/ti/p/~nailtimetk22" target="_blank" rel="noopener"
              className="flex flex-col items-center justify-center gap-3 bg-cream px-8 py-10 text-center shadow-2xl transition-all duration-300 hover:-translate-y-1 w-64 sm:w-72">
              <svg className="w-12 h-12 text-sand" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              <p className="text-sm font-bold uppercase tracking-widest text-sand">LINE</p>
              <p className="text-xs text-site-gray">@nailtimetk22</p>
            </a>
          </div>
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
        <div className="flex flex-col justify-center gap-4 bg-cream px-6 py-12 sm:px-10 md:px-16 md:py-16">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand">Contact Our Salon</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl font-bold sm:text-4xl">ติดต่อร้านของเรา</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-xs uppercase tracking-widest text-site-gray mt-2">โทรนัดหมาย</p>
            <a href="tel:0647451946" className="text-2xl font-bold text-sand transition-colors hover:text-sand-dark sm:text-3xl">
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
          {/* Map on mobile */}
          <Reveal delay={0.4} className="block md:hidden">
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

      {/* COUPON */}
      <section className="bg-site-dark px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-6 text-center">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-sand">First Visit Offer</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-serif leading-snug">
              รับส่วนลด <span className="text-sand">50 บาท</span><br />สำหรับการทำเล็บครั้งแรก
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-sm text-white/60 leading-relaxed">
              กรอกชื่อและเบอร์โทร แล้วเพิ่มเพื่อน LINE OA ของเรา<br />แจ้งแชทว่า <strong className="text-white/90">"คูปองใหม่"</strong> เพื่อรับสิทธิ์
            </p>
          </Reveal>
          <Reveal delay={0.3} className="w-full">
            <LineCouponForm />
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-sand pt-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pb-14 sm:px-6 md:grid-cols-3 md:gap-14">
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
