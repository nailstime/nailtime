'use client'
import { motion, cubicBezier } from 'framer-motion'
import Link from 'next/link'
import { CountUp } from '@/components/ui/CountUp'

const ease = cubicBezier(0.76, 0, 0.24, 1)

function MaskReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div style={{ overflow: 'hidden' }}>
      <motion.div
        initial={{ y: '110%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        transition={{ duration: 1, ease, delay }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 overflow-hidden"
      style={{ height: 'calc(100vh - 68px - 90px)', minHeight: 480 }}
    >
      {/* LEFT — Text */}
      <div className="flex flex-col justify-center px-10 md:px-20 py-16 bg-cream gap-5 relative">

        {/* Decorative number */}
        <motion.span
          className="absolute top-10 right-10 text-[120px] font-bold text-sand/8 leading-none select-none pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
        >
          01
        </motion.span>

        <MaskReveal delay={0.1}>
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-site-gray">
            Nail Studio · ดอนหัวฬอ ชลบุรี
          </p>
        </MaskReveal>

        <div className="flex flex-col gap-1">
          <MaskReveal delay={0.25}>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] text-site-dark">
              ความสวยงาม
            </h1>
          </MaskReveal>
          <MaskReveal delay={0.38}>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] text-site-dark">
              เริ่มต้น
            </h1>
          </MaskReveal>
          <MaskReveal delay={0.51}>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] text-sand">
              ที่ปลายนิ้ว
            </h1>
          </MaskReveal>
        </div>

        <motion.p
          className="text-sm text-site-gray leading-relaxed"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.75 }}
        >
          ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น<br />
          วัสดุคุณภาพสูง ช่างมืออาชีพ
        </motion.p>

        <motion.div
          className="flex items-center gap-7 flex-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.9 }}
        >
          <Link href="/booking"
            className="rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase px-8 py-3.5 hover:bg-sand-dark transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95">
            จองนัดเลย
          </Link>
          <Link href="#services" className="text-xs font-semibold tracking-widest uppercase text-sand">
            ดูบริการ →
          </Link>
        </motion.div>

        <motion.div
          className="flex items-center gap-6 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          <div>
            <span className="block text-2xl font-bold text-sand leading-none">
              <CountUp to={2000} suffix="+" duration={2000} />
            </span>
            <span className="text-xs text-site-gray mt-1 tracking-wide">ผู้ติดตาม</span>
          </div>
          <div className="w-px h-10 bg-sand/30" />
          <div>
            <span className="block text-2xl font-bold text-sand leading-none">5★</span>
            <span className="text-xs text-site-gray mt-1 tracking-wide">รีวิวจากลูกค้า</span>
          </div>
        </motion.div>
      </div>

      {/* RIGHT — Image wipe in */}
      <div className="relative overflow-hidden bg-[#e8d5c0] hidden md:block">
        {/* Image */}
        <motion.div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200')] bg-center bg-cover"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease, delay: 0.2 }}
        />
        {/* Curtain wipe overlay */}
        <motion.div
          className="absolute inset-0 bg-cream origin-right"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 1, ease, delay: 0.15 }}
        />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-cream/20 to-transparent pointer-events-none" />
      </div>
    </section>
  )
}
