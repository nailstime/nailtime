import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight, Clock, MapPin, Phone, Star } from 'lucide-react'
import { Reveal, StaggerParent, StaggerChild } from '@/components/ui/Reveal'
import { FloatingCTA } from '@/components/layout/FloatingCTA'
import { HomeBookingBar } from '@/components/booking/HomeBookingBar'
import { LineCouponForm } from '@/components/sections/LineCouponForm'
import { SiteNav } from '@/components/site/SiteNav'
import { GelStudio } from '@/components/site/studio/GelStudio'
import { ServiceMenu } from '@/components/site/ServiceMenu'
import { WorksGallery } from '@/components/site/WorksGallery'
import { Parallax } from '@/components/site/Parallax'
import { LeafShadow } from '@/components/site/LeafShadow'
import { FacebookIcon, InstagramIcon, LineIcon } from '@/components/site/SocialIcons'
import { CATALOG, PILLARS, POLISHES, REVIEWS, SHOP } from '@/components/site/data'
import { anuphan, shippori } from '@/components/site/fonts'
import s from '@/components/site/site.module.css'

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

function Kicker({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.22em] ${light ? 'text-[#e6cdb6]' : 'text-[var(--nt-accent)]'}`}>
      <span className={`h-px w-8 ${light ? 'bg-[#e6cdb6]/60' : 'bg-[var(--nt-accent)]/50'}`} />
      {children}
    </p>
  )
}

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
    <div className={`${s.root} ${anuphan.variable} ${shippori.variable}`}>
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
      <div className={s.grain} aria-hidden="true" />
      <SiteNav />
      <FloatingCTA />

      <main>
        {/* ── HERO · Gel Studio ─────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-[68px]">
          <LeafShadow className={s.leaves} />
          <LeafShadow className={`${s.leaves} ${s.leavesLeft}`} />
          <p aria-hidden="true" className={`${s.jp} pointer-events-none absolute right-5 top-28 hidden text-sm tracking-[0.6em] text-[var(--nt-ink)]/35 [writing-mode:vertical-rl] xl:block`}>
            ネイルタイム ─ 指先から、きれいを。
          </p>

          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-8 sm:px-8 lg:min-h-[calc(100svh-68px)] lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-6 lg:pb-12">
            <div className="flex flex-col gap-6 lg:pr-4">
              <Reveal y={16}>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--nt-ink-2)]">
                  <span className={`${s.jp} text-[var(--nt-accent)]`}>ネイルタイム</span>
                  <span className="h-px w-6 bg-[var(--nt-ink)]/25" />
                  Nail Time &amp; Spa · ดอนหัวฬอ ชลบุรี
                </p>
              </Reveal>
              <h1 className={`${s.thaiDisplay} text-[clamp(2.6rem,9vw,4.6rem)] font-semibold leading-[1.18] tracking-tight text-[var(--nt-ink)]`}>
                <Reveal y={40} delay={0.05}><span className="block whitespace-nowrap">ความสวยงาม</span></Reveal>
                <Reveal y={40} delay={0.12}><span className="block whitespace-nowrap">เริ่มต้น</span></Reveal>
                <Reveal y={40} delay={0.19}><span className="block whitespace-nowrap text-[var(--nt-accent)]">ที่ปลายนิ้ว</span></Reveal>
              </h1>
              <Reveal delay={0.25}>
                <p className="max-w-[34ch] text-[17px] leading-relaxed text-[var(--nt-ink-2)]">
                  ร้านทำเล็บเจลสไตล์ญี่ปุ่นในดอนหัวฬอ ลองเลือกสีบนเล็บตัวอย่างข้างๆ นี้ก่อน แล้วจองคิวมาทำจริงกับช่างของเรา
                </p>
              </Reveal>
              <Reveal delay={0.35}>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/booking"
                    className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-[var(--nt-ink)] px-7 text-[15px] font-semibold text-white transition-colors hover:bg-[#4a3a2a]"
                  >
                    จองคิวออนไลน์
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                  <a href="#works" className="inline-flex min-h-12 items-center px-4 text-[15px] text-[var(--nt-ink)] underline decoration-[var(--nt-ink)]/25 underline-offset-[6px] transition-colors hover:decoration-[var(--nt-ink)]">
                    ดูผลงานจริง
                  </a>
                </div>
              </Reveal>
              <Reveal delay={0.45}>
                <dl className="mt-2 grid max-w-md grid-cols-3 border-t border-[var(--nt-ink)]/12 pt-5 text-sm">
                  <div>
                    <dt className="text-[var(--nt-ink-2)]">เปิดทุกวัน</dt>
                    <dd className="mt-1 font-semibold tabular-nums">09 – 19 น.</dd>
                  </div>
                  <div className="border-l border-[var(--nt-ink)]/12 pl-4">
                    <dt className="text-[var(--nt-ink-2)]">ดูแลลูกค้า</dt>
                    <dd className="mt-1 font-semibold">ตั้งแต่ 2019</dd>
                  </div>
                  <div className="border-l border-[var(--nt-ink)]/12 pl-4">
                    <dt className="text-[var(--nt-ink-2)]">สีเจล</dt>
                    <dd className="mt-1 font-semibold">นำเข้าเกาหลี</dd>
                  </div>
                </dl>
              </Reveal>
            </div>

            <div className="lg:h-[min(680px,calc(100svh-200px))]">
              <GelStudio />
            </div>
          </div>
        </section>

        {/* Booking bar: the existing, unchanged booking component. */}
        <HomeBookingBar />

        {/* ── SERVICES · What we do ─────────────────────────────────── */}
        <section id="services" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 sm:px-8 md:py-28">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
            <Reveal>
              <Kicker>What we do</Kicker>
              <h2 className={`${s.thaiDisplay} mt-5 text-4xl font-semibold leading-tight sm:text-5xl`}>บริการของเรา</h2>
              <p className="mt-5 max-w-[36ch] leading-relaxed text-[var(--nt-ink-2)]">
                ทำเล็บเจล เพ้นท์เล็บ ต่อเล็บเจล อะคริลิก PVC และสปามือเท้า ทุกบริการเริ่มจากการดูแลเล็บและผิวรอบเล็บก่อนลงสีเสมอ
              </p>
            </Reveal>
            <StaggerParent className="grid gap-px overflow-hidden rounded-3xl border border-[var(--nt-ink)]/10 bg-[var(--nt-ink)]/10 sm:grid-cols-3">
              {PILLARS.map((p, i) => (
                <StaggerChild key={p.en} className="flex flex-col gap-4 bg-[var(--nt-cream)] p-6 sm:min-h-[280px] sm:p-7">
                  <span className="text-xs tabular-nums text-[var(--nt-accent)]">0{i + 1}</span>
                  <span className={`${s.jp} whitespace-nowrap text-2xl text-[var(--nt-ink)]/80 lg:text-3xl`} aria-hidden="true">{p.jp}</span>
                  <h3 className={`${s.display} mt-auto text-2xl italic`}>{p.en}</h3>
                  <p className="text-[15px] leading-relaxed text-[var(--nt-ink-2)]">{p.th}</p>
                </StaggerChild>
              ))}
            </StaggerParent>
          </div>
        </section>

        {/* ── STORY ─────────────────────────────────────────────────── */}
        <section id="story" className="relative scroll-mt-20 overflow-hidden bg-[var(--nt-paper)] py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 md:grid-cols-2 md:gap-16">
            <div className="relative mx-auto h-[440px] w-full max-w-[520px] sm:h-[540px]">
              <Parallax amount={30} className="absolute left-0 top-0 h-[82%] w-[62%]">
                <div className="relative h-full w-full overflow-hidden rounded-b-2xl rounded-t-full bg-[#e8dccb] shadow-[0_30px_60px_-30px_rgba(42,32,23,0.45)]">
                  <Image src="/images/portfolio/1.webp" alt="เล็บเจลลายผีเสื้อโทนชมพูจากร้าน Nail Time" fill sizes="(min-width: 768px) 320px, 60vw" className="object-cover" />
                </div>
              </Parallax>
              <Parallax amount={70} className="absolute bottom-0 right-0 h-[52%] w-[44%]">
                <div className="relative h-full w-full overflow-hidden rounded-b-2xl rounded-t-full bg-[#e8dccb] ring-8 ring-[var(--nt-paper)]">
                  <Image src="/images/portfolio/2.webp" alt="ผลงานเล็บเจลจากร้าน Nail Time" fill sizes="(min-width: 768px) 240px, 45vw" className="object-cover" />
                </div>
              </Parallax>
              <Parallax amount={110} className="absolute right-[6%] top-[4%]">
                <p className={`${s.jp} text-[13px] tracking-[0.5em] text-[var(--nt-ink)]/45 [writing-mode:vertical-rl]`} aria-hidden="true">
                  爪の時間、あなたの時間。
                </p>
              </Parallax>
            </div>

            <div>
              <Reveal>
                <Kicker>Nail Time Story · Since 2019</Kicker>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className={`${s.display} mt-5 text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1.05]`}>
                  Because Nail Time is <em>your time</em> for happiness.
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-7 flex max-w-[60ch] flex-col gap-5 leading-[1.85] text-[var(--nt-ink-2)]">
                  <p>
                    จากจุดเริ่มต้นของร้านเล็กๆ ในย่านดอนหัวฬ่อ ที่เกิดขึ้นจากความรักในการทำเล็บ วันนี้ Nail Time &amp; Spa เติบโตขึ้นด้วยแพสชันที่ไม่เคยหยุดพัฒนา เราเชื่อว่าเล็บที่สวยไม่ใช่แค่เรื่องของแฟชั่น แต่คือสิ่งที่ช่วยเติมเต็มความมั่นใจและรอยยิ้มให้คุณในทุกๆ วัน
                  </p>
                  <p>
                    เราคัดสรรสีเจลและผลิตภัณฑ์พรีเมียมแบรนด์แท้นำเข้าจากเกาหลี ควบคู่กับเทคนิคการเพ้นท์และต่อเล็บที่ประณีต ในพื้นที่ส่วนตัวที่ดูแลลูกค้าตามคิวจองอย่างใส่ใจ
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.3}>
                <ul className="mt-8 grid gap-4 border-t border-[var(--nt-ink)]/12 pt-6 sm:grid-cols-2">
                  <li>
                    <p className="font-semibold">Always Clean</p>
                    <p className="mt-1 text-sm text-[var(--nt-ink-2)]">อุปกรณ์สะอาด ปลอดภัยทุกครั้ง</p>
                  </li>
                  <li>
                    <p className="font-semibold">Always Leading</p>
                    <p className="mt-1 text-sm text-[var(--nt-ink-2)]">ตามเทรนด์ญี่ปุ่น อัปเดตทุกซีซั่น</p>
                  </li>
                </ul>
              </Reveal>
              <Reveal delay={0.4}>
                <a href={SHOP.facebook} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-11 items-center gap-2 text-[15px] font-medium underline decoration-[var(--nt-ink)]/25 underline-offset-[6px] hover:decoration-[var(--nt-ink)]">
                  <FacebookIcon size={16} /> ติดตามร้านบน Facebook
                </a>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── WORKS ─────────────────────────────────────────────────── */}
        <section id="works" className="mx-auto max-w-7xl scroll-mt-20 px-5 pb-16 pt-20 sm:px-8 md:pb-24 md:pt-28">
          <div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
            <Reveal>
              <Kicker>Our work · 作品</Kicker>
              <h2 className={`${s.thaiDisplay} mt-5 text-4xl font-semibold sm:text-5xl`}>ผลงานจากมือช่างจริง</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <a href={SHOP.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--nt-ink)]/20 px-5 text-sm transition-colors hover:border-[var(--nt-ink)]">
                <InstagramIcon size={16} /> ดูทั้งหมดบน Instagram {SHOP.instagramHandle}
              </a>
            </Reveal>
          </div>
          <WorksGallery />
        </section>

        {/* ── CATALOG ───────────────────────────────────────────────── */}
        <section className="overflow-hidden bg-[var(--nt-ink)] py-16 text-white md:py-20" aria-labelledby="catalog-title">
          <div className="mx-auto mb-10 flex max-w-7xl flex-col justify-between gap-4 px-5 sm:px-8 md:flex-row md:items-end">
            <div>
              <Kicker light>Catalog idea</Kicker>
              <h2 id="catalog-title" className={`${s.thaiDisplay} mt-4 text-3xl font-semibold sm:text-4xl`}>ยังไม่มีลายในใจ? เลือกจากแคตตาล็อกได้</h2>
            </div>
            <p className="max-w-[40ch] text-sm leading-relaxed text-white/70">แคปลายที่ชอบไว้ แล้วส่งให้ช่างดูตอนจอง หรือทักทาง LINE {SHOP.lineId}</p>
          </div>
          <div className={`${s.marqueeWrap} flex flex-col gap-3`}>
            {[false, true].map((reverse) => (
              <div key={String(reverse)} className={`${s.marquee} ${reverse ? s.marqueeReverse : ''}`}>
                {[...CATALOG, ...CATALOG].map((src, i) => (
                  <div key={i} className="relative h-44 w-44 shrink-0 overflow-hidden rounded-2xl sm:h-52 sm:w-52">
                    <Image src={src} alt="" fill sizes="208px" className="object-cover" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── MENU & PRICES ─────────────────────────────────────────── */}
        <section id="menu" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 sm:px-8 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <Kicker>Treatments &amp; Prices</Kicker>
                <h2 className={`${s.thaiDisplay} mt-5 text-4xl font-semibold sm:text-5xl`}>เมนูและราคา</h2>
                <p className="mt-5 max-w-[34ch] leading-relaxed text-[var(--nt-ink-2)]">
                  กดที่บริการเพื่อเลือกวันและเวลาได้ทันที ราคาอาจเปลี่ยนตามความยาวเล็บและรายละเอียดลาย
                </p>
              </Reveal>
              <Reveal delay={0.1} className="mt-8 hidden lg:block">
                <div className="relative aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-b-3xl rounded-t-full">
                  <Image src="/images/portfolio/3.webp" alt="ผลงานเล็บเจลจากร้าน Nail Time" fill sizes="340px" className="object-cover" />
                </div>
              </Reveal>
            </div>
            <div>
              <ServiceMenu services={services} />
              <a href={SHOP.tel} className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--nt-ink-2)] hover:text-[var(--nt-ink)]">
                <Phone size={15} aria-hidden="true" /> สอบถามราคาลายพิเศษ โทร {SHOP.phone}
              </a>
            </div>
          </div>
        </section>

        {/* ── POLISHES ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[var(--nt-sand)] px-5 py-20 sm:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mb-14 flex flex-col items-center gap-3 text-center">
              <span className="rounded-full bg-white/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nt-ink)]">GellyFit · Korea Professional</span>
              <h2 className={`${s.display} text-4xl italic text-[var(--nt-ink)] sm:text-5xl`}>Mix &amp; Match Polishes</h2>
              <p className="text-[15px] text-[var(--nt-ink)]/75">Combination สุดฮิตที่ร้านเลือกมาให้</p>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4">
              {POLISHES.map((b, i) => (
                <Parallax key={b.name} amount={[20, 60, 30, 70][i]} className="group text-center">
                  <Image
                    src={b.src}
                    alt={b.name}
                    width={120}
                    height={260}
                    className="mx-auto mb-6 h-[220px] w-auto object-contain drop-shadow-[-18px_18px_22px_rgba(42,32,23,0.22)] transition-transform duration-500 group-hover:-translate-y-3 sm:h-[260px]"
                  />
                  <p className="font-semibold text-[var(--nt-ink)]">{b.name}</p>
                  <p className="mt-1 text-sm text-[var(--nt-ink)]/70">{b.sub}</p>
                </Parallax>
              ))}
            </div>
          </div>
        </section>

        {/* ── REVIEWS ───────────────────────────────────────────────── */}
        <section id="reviews" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 sm:px-8 md:py-28">
          <Reveal className="mb-12 md:mb-16">
            <Kicker>Happy clients · お客様の声</Kicker>
            <h2 className={`${s.thaiDisplay} mt-5 text-4xl font-semibold sm:text-5xl`}>เสียงจากลูกค้า</h2>
          </Reveal>
          <StaggerParent className="grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <StaggerChild key={r.name} className={i === 1 ? 'md:translate-y-10' : ''}>
                <figure className="flex h-full flex-col gap-6 rounded-3xl border border-[var(--nt-ink)]/10 bg-white/70 p-7">
                  <div className="flex gap-1 text-[#b98a5e]" role="img" aria-label="5 ดาว">
                    {Array.from({ length: 5 }).map((_, k) => <Star key={k} size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />)}
                  </div>
                  <blockquote className={`${s.thaiDisplay} flex-1 text-xl leading-relaxed text-[var(--nt-ink)]`}>“{r.text}”</blockquote>
                  <figcaption className="flex items-center justify-between border-t border-[var(--nt-ink)]/10 pt-4 text-sm">
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-[var(--nt-ink-2)]">{r.date}</span>
                  </figcaption>
                </figure>
              </StaggerChild>
            ))}
          </StaggerParent>
        </section>

        {/* ── VISIT ─────────────────────────────────────────────────── */}
        <section id="visit" className="scroll-mt-20 bg-[var(--nt-paper)]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-2 md:py-24">
            <div className="flex flex-col">
              <Reveal>
                <Kicker>Visit the salon</Kicker>
                <h2 className={`${s.thaiDisplay} mt-5 text-4xl font-semibold sm:text-5xl`}>แวะมาหาเรา</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <a href={SHOP.tel} className={`${s.display} mt-8 inline-block text-4xl tabular-nums text-[var(--nt-ink)] transition-colors hover:text-[var(--nt-accent)] sm:text-5xl`}>
                  {SHOP.phone}
                </a>
              </Reveal>
              <Reveal delay={0.2}>
                <ul className="mt-8 flex flex-col gap-4 text-[15px] text-[var(--nt-ink-2)]">
                  <li className="flex gap-3">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-[var(--nt-accent)]" aria-hidden="true" />
                    <span>เทศบาลดอนหัวฬอ ชลบุรี<br />ตรงข้ามที่ทำการเทศบาล</span>
                  </li>
                  <li className="flex gap-3">
                    <Clock size={18} className="mt-0.5 shrink-0 text-[var(--nt-accent)]" aria-hidden="true" />
                    <span>เปิดทุกวัน <strong className="text-[var(--nt-ink)]">{SHOP.hours} น.</strong></span>
                  </li>
                </ul>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="mt-8 flex flex-wrap gap-2">
                  <a href={SHOP.maps} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--nt-ink)] px-5 text-sm font-semibold text-white hover:bg-[#4a3a2a]">
                    เปิดใน Google Maps <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                  <a href={SHOP.line} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--nt-ink)]/20 px-5 text-sm hover:border-[var(--nt-ink)]">
                    <LineIcon size={16} /> LINE
                  </a>
                  <a href={SHOP.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--nt-ink)]/20 px-5 text-sm hover:border-[var(--nt-ink)]">
                    <InstagramIcon size={16} /> Instagram
                  </a>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.1} className="min-h-[320px] overflow-hidden rounded-3xl border border-[var(--nt-ink)]/10">
              <iframe
                src={SHOP.mapEmbed}
                className="h-full min-h-[320px] w-full border-0 grayscale-[35%] sepia-[15%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="แผนที่ร้าน Nail Time & Spa"
              />
            </Reveal>
          </div>
        </section>

        {/* ── COUPON (existing form, unchanged) ─────────────────────── */}
        <section className="relative overflow-hidden bg-[var(--nt-ink)] px-5 py-20 sm:px-8 md:py-24">
          <p aria-hidden="true" className={`${s.jp} pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none text-[22vw] leading-none text-white/[0.04]`}>
            初回
          </p>
          <div className="relative mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
            <Kicker light>First visit offer</Kicker>
            <h2 className={`${s.thaiDisplay} text-3xl font-semibold leading-snug text-white md:text-4xl`}>
              รับส่วนลด <span className="text-[#e6cdb6]">50 บาท</span><br />สำหรับการทำเล็บครั้งแรก
            </h2>
            <p className="text-[15px] leading-relaxed text-white/70">
              กรอกชื่อและเบอร์โทร แล้วเพิ่มเพื่อน LINE OA ของเรา<br />แจ้งแชทว่า <strong className="text-white">&ldquo;คูปองใหม่&rdquo;</strong> เพื่อรับสิทธิ์
            </p>
            <div className="w-full">
              <LineCouponForm />
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="bg-[var(--nt-cream)] pb-28 pt-16 md:pb-10">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className={`${s.display} text-3xl italic`}>Nail Time &amp; Spa</p>
            <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-[var(--nt-ink-2)]">ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น ดอนหัวฬอ ชลบุรี</p>
            <div className="mt-5 flex gap-2">
              {[
                { href: SHOP.instagram, label: 'Instagram', icon: <InstagramIcon size={17} /> },
                { href: SHOP.facebook, label: 'Facebook', icon: <FacebookIcon size={17} /> },
                { href: SHOP.line, label: 'LINE', icon: <LineIcon size={17} /> },
              ].map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--nt-ink)]/15 text-[var(--nt-ink-2)] transition-colors hover:border-[var(--nt-ink)] hover:text-[var(--nt-ink)]">
                  {l.icon}
                </a>
              ))}
            </div>
          </div>
          <nav aria-label="ลิงก์ส่วนท้าย">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nt-accent)]">เมนู</p>
            <ul className="mt-4 flex flex-col text-[15px]">
              {[['#services', 'บริการ'], ['#works', 'ผลงาน'], ['#menu', 'ราคา'], ['#visit', 'ติดต่อ']].map(([href, label]) => (
                <li key={href}><a href={href} className="inline-flex min-h-10 items-center text-[var(--nt-ink-2)] hover:text-[var(--nt-ink)]">{label}</a></li>
              ))}
              <li><Link href="/booking" className="inline-flex min-h-10 items-center text-[var(--nt-ink-2)] hover:text-[var(--nt-ink)]">จองคิว</Link></li>
              <li><Link href="/booking/status" className="inline-flex min-h-10 items-center text-[var(--nt-ink-2)] hover:text-[var(--nt-ink)]">เช็กสถานะการจอง</Link></li>
            </ul>
          </nav>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nt-accent)]">ติดต่อ</p>
            <p className="mt-4 text-[15px] leading-8 text-[var(--nt-ink-2)]">
              <a href={SHOP.tel} className="hover:text-[var(--nt-ink)]">{SHOP.phone}</a><br />
              เทศบาลดอนหัวฬอ ชลบุรี<br />
              เปิดทุกวัน {SHOP.hours} น.
            </p>
          </div>
        </div>
        <p aria-hidden="true" className={`${s.jp} mx-auto mt-14 max-w-7xl select-none overflow-hidden whitespace-nowrap px-5 text-center text-[clamp(3rem,13vw,11rem)] leading-none text-[var(--nt-ink)]/[0.07] sm:px-8`}>
          ネイルタイム
        </p>
        <div className="mx-auto mt-6 flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-[var(--nt-ink)]/10 px-5 pt-6 text-xs text-[var(--nt-ink-2)] sm:px-8 md:flex-row">
          <p>© 2019–2026 Nail Time &amp; Spa ネイルタイム · ดอนหัวฬอ ชลบุรี</p>
          <p>เปิดทุกวัน {SHOP.hours} น.</p>
        </div>
      </footer>
    </div>
  )
}
