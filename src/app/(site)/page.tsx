import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

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

const services = [
  { name: 'ทำเล็บเจล',     en: 'Gel Nails',       icon: '✨', desc: 'เจลคุณภาพสูง ติดทนนาน 3–4 สัปดาห์' },
  { name: 'เพ้นท์เล็บ',    en: 'Nail Art',        icon: '🎨', desc: 'ลายอิสระ สไตล์ญี่ปุ่น ทุกแบบ' },
  { name: 'ต่อเล็บเจล',    en: 'Gel Extension',   icon: '🌸', desc: 'ยาวสวย แข็งแรง รูปทรงตามต้องการ' },
  { name: 'อะคีลิก',       en: 'Acrylic',         icon: '💎', desc: 'ทนทานเป็นพิเศษ รูปทรงสวย' },
  { name: 'PVC / แก้ว',    en: 'Glass Effect',    icon: '✦',  desc: 'เทรนด์ฮิต effect ใส โมเดิร์น' },
  { name: 'สปามือ & เท้า', en: 'Nail Spa',        icon: '🦶', desc: 'ดูแลครบวงจร ขัดผิว นวดผ่อนคลาย' },
]

export default function HomePage() {
  return (
    <>
      <Header />

      {/* HERO */}
      <section className="grid grid-cols-1 md:grid-cols-2" style={{ height: 'calc(100vh - 68px - 90px)', minHeight: 480 }}>
        <div className="flex flex-col justify-center px-10 md:px-20 py-16 bg-cream gap-5">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-site-gray">
            Nail Studio · ดอนหัวฬอ ชลบุรี
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] text-site-dark">
            ความสวยงาม<br />เริ่มต้น<br />ที่ปลายนิ้ว
          </h1>
          <p className="text-sm text-site-gray leading-relaxed">
            ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น<br />
            วัสดุคุณภาพสูง ช่างมืออาชีพ
          </p>
          <div className="flex items-center gap-7 flex-wrap mt-2">
            <Link href="/booking"
              className="rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase px-8 py-3.5 hover:bg-sand-dark transition-all hover:-translate-y-0.5 hover:shadow-lg">
              จองนัดเลย
            </Link>
            <Link href="#services" className="text-xs font-semibold tracking-widest uppercase text-sand">
              ดูบริการ →
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div>
              <span className="block text-2xl font-bold text-sand leading-none">2K+</span>
              <span className="text-xs text-site-gray mt-1 tracking-wide">ผู้ติดตาม</span>
            </div>
            <div className="w-px h-10 bg-sand/30" />
            <div>
              <span className="block text-2xl font-bold text-sand leading-none">5★</span>
              <span className="text-xs text-site-gray mt-1 tracking-wide">รีวิวจากลูกค้า</span>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden bg-[#e8d5c0] hidden md:block">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200')] bg-center bg-cover" />
        </div>
      </section>

      {/* BOOKING BAR */}
      <BookingBar />

      {/* FEATURES */}
      <section id="services" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              { title: 'Nail Care', desc: 'ดูแลเล็บมือเท้าครบครัน ทำความสะอาด ตกแต่งผิว' },
              { title: 'Nail Art',  desc: 'เพ้นท์ลายอิสระ สไตล์ญี่ปุ่น ลาย custom ทุกแบบ' },
              { title: 'Tips & Trends', desc: 'อัพเดตเทรนด์ใหม่ แนะนำสีและลาย เปลี่ยนทุกซีซั่น' },
            ].map(f => (
              <div key={f.title}>
                <div className="w-20 h-20 mx-auto mb-5 rounded-full border border-sand/40 flex items-center justify-center">
                  <span className="text-2xl text-sand">✦</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-site-gray leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="grid grid-cols-1 md:grid-cols-2 min-h-[560px]">
        <div className="relative bg-[#e0d0ba] overflow-hidden min-h-[320px]">
          <div className="absolute left-16 top-10 w-[260px] bottom-10 rounded-[100px_100px_0_0] bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800')] bg-center bg-cover shadow-2xl" />
          <div className="absolute right-10 bottom-14 w-[180px] h-[260px] rounded-[100px_100px_0_0] bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600')] bg-top bg-cover shadow-[-20px_-20px_30px_rgba(0,0,0,0.16)]" />
        </div>
        <div className="flex flex-col justify-center px-10 md:px-16 py-16 bg-cream gap-4">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand">Our Story</p>
          <h2 className="text-4xl font-bold">เกี่ยวกับร้านของเรา</h2>
          <p className="text-sm text-site-gray leading-relaxed">
            ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บเจล อะคีลิก PVC และสปามือเท้า
            ตั้งอยู่ที่ดอนหัวฬอ ชลบุรี ตรงข้ามที่ทำการเทศบาล
          </p>
          <p className="text-sm text-site-gray leading-relaxed">
            เราเน้นสไตล์ญี่ปุ่น ใช้วัสดุนำเข้าคุณภาพสูง ไม่แพ้ผิว ช่างมืออาชีพ ใส่ใจทุกรายละเอียด
          </p>
          <ul className="flex flex-col gap-2 my-2 text-sm text-site-gray">
            <li><strong className="text-site-dark">Always Clean</strong> — อุปกรณ์สะอาด ปลอดภัยทุกครั้ง</li>
            <li><strong className="text-site-dark">Always Leading</strong> — ตามเทรนด์ญี่ปุ่น อัพเดตทุกซีซั่น</li>
          </ul>
          <a href="https://www.facebook.com/p/Nail-Time-Spa-%E3%83%8D%E3%82%A4%E3%83%AB%E3%82%BF%E3%82%A4%E3%83%A0-100065117245969/"
            target="_blank" rel="noopener"
            className="self-start rounded-full border border-site-dark text-xs font-medium uppercase tracking-widest px-7 py-3 hover:bg-site-dark hover:text-white transition-all mt-2">
            ดูเพจ Facebook →
          </a>
        </div>
      </section>

      {/* MIX & MATCH POLISHES */}
      <section className="bg-sand py-20 px-10">
        <h2 className="text-center text-2xl font-bold uppercase tracking-[0.1em] text-white mb-14">
          Mix &amp; Match Polishes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { src: '/images/bottle-base.png',  name: 'Base Coat',    sub: 'Film shadow / No.5 oz' },
            { src: '/images/bottle-gel.png',   name: 'Gel Polish',   sub: 'Sorbet fine / No.5 oz' },
            { src: '/images/bottle-top.png',   name: 'Top Coat',     sub: 'Summer mirage / No.5 oz' },
            { src: '/images/bottle-matte.png', name: 'Matte Polish', sub: 'Blue Paletts / No.5 oz' },
          ].map(b => (
            <div key={b.name} className="text-center">
              <Image src={b.src} alt={b.name} width={100} height={220}
                className="mx-auto mb-5 object-contain drop-shadow-[-16px_-6px_20px_rgba(0,0,0,0.18)]"
                style={{ height: 220, width: 'auto' }} />
              <p className="text-sm font-semibold text-white">{b.name}</p>
              <p className="text-xs text-white/70 mt-1">{b.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TREATMENTS & PRICES */}
      <section id="prices" className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
        <div className="flex flex-col justify-center px-10 md:px-16 py-16 bg-cream gap-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand">Treatments &amp; Prices</p>
          <h2 className="text-4xl font-bold">บริการและราคา</h2>
          <div className="flex flex-col divide-y divide-sand/20">
            {services.map(s => (
              <div key={s.name} className="flex items-start justify-between py-4 gap-4">
                <div>
                  <strong className="text-sm font-semibold text-site-dark">{s.name}</strong>
                  <p className="text-xs text-site-gray mt-0.5">{s.desc}</p>
                </div>
                <span className="text-xs font-semibold text-sand whitespace-nowrap pt-0.5">สอบถาม</span>
              </div>
            ))}
          </div>
          <a href="tel:0647451946"
            className="self-start rounded-full border border-site-dark text-xs font-medium uppercase tracking-widest px-7 py-3 hover:bg-site-dark hover:text-white transition-all">
            โทรสอบถามราคา
          </a>
        </div>
        <div className="hidden md:block bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1000')] bg-center bg-cover min-h-[400px]" />
      </section>

      {/* GALLERY */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand mb-2">Our Work</p>
            <h2 className="text-4xl font-bold text-site-dark">ผลงานของเรา</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
              'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80&crop=entropy',
              'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=600&q=80',
              'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=600&q=80&crop=entropy',
              'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80&sat=-50',
              'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=600&q=80&sat=-30',
            ].map((src, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl aspect-square bg-cream group">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${src})` }} />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="https://www.instagram.com/nail_time_bytt/" target="_blank" rel="noopener"
              className="inline-flex items-center gap-2 rounded-full border border-site-dark text-xs font-medium uppercase tracking-widest px-8 py-3 hover:bg-site-dark hover:text-white transition-all">
              ดูผลงานทั้งหมดบน Instagram →
            </a>
          </div>
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
            className="bg-cream shadow-2xl px-16 py-10 text-center flex flex-col items-center gap-2">
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
        <div className="hidden md:block bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1000')] bg-center bg-cover" />
        <div className="flex flex-col justify-center px-10 md:px-16 py-16 bg-cream gap-4">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sand">Contact Our Salon</p>
          <h2 className="text-4xl font-bold">ติดต่อร้านของเรา</h2>
          <p className="text-xs uppercase tracking-widest text-site-gray mt-2">โทรนัดหมาย</p>
          <a href="tel:0647451946" className="text-3xl font-bold text-sand">064 745 1946</a>
          <div className="flex flex-col gap-2 text-sm text-site-gray">
            <p>📍 เทศบาลดอนหัวฬอ ชลบุรี ตรงข้ามที่ทำการเทศบาล</p>
            <p>📷 Instagram: <a href="https://www.instagram.com/nail_time_bytt/" target="_blank" rel="noopener" className="text-sand">@nail_time_bytt</a></p>
          </div>
          <div className="flex items-end gap-4 border-b border-[#c8b0a0] pb-2 mt-4 max-w-sm">
            <input type="email" placeholder="กรอกอีเมลเพื่อรับโปรโมชั่น"
              className="flex-1 bg-transparent outline-none text-sm text-site-dark placeholder:text-site-gray" />
            <button className="text-xs font-bold uppercase tracking-widest text-sand whitespace-nowrap">Subscribe</button>
          </div>
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
                  className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-xs text-white font-semibold hover:bg-white/20 transition-all">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-4">เมนู</h4>
            {[['/#services','บริการ'],['/#story','เกี่ยวกับ'],['/#products','ผลงาน'],['/booking','จองนัด']].map(([href,label]) => (
              <Link key={href} href={href} className="block text-sm text-white/75 mb-2 hover:text-white transition-colors">{label}</Link>
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
          <p>© 2026 Nail Time &amp; Spa ネイルタイム</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </>
  )
}

function BookingBar() {
  return (
    <div className="bg-sand px-10">
      <div className="max-w-6xl mx-auto flex items-center h-[90px] gap-0">
        <div className="flex-1 flex flex-col gap-1 px-6">
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/70">บริการ</span>
          <Link href="/booking" className="text-sm font-medium text-white">เลือกบริการ →</Link>
        </div>
        <div className="w-px h-10 bg-white/30" />
        <div className="flex-1 flex flex-col gap-1 px-6">
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/70">วันที่</span>
          <Link href="/booking" className="text-sm font-medium text-white">เลือกวันที่ →</Link>
        </div>
        <div className="w-px h-10 bg-white/30" />
        <div className="flex-1 flex flex-col gap-1 px-6">
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/70">เวลา</span>
          <Link href="/booking" className="text-sm font-medium text-white">เลือกเวลา →</Link>
        </div>
        <Link href="/booking"
          className="ml-6 rounded-full bg-white text-sand-deep text-xs font-medium tracking-widest uppercase px-8 py-3 hover:bg-cream transition-all whitespace-nowrap">
          จองนัด
        </Link>
      </div>
    </div>
  )
}
