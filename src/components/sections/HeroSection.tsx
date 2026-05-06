'use client'
import { motion, cubicBezier } from 'framer-motion'
import Link from 'next/link'
import { CountUp } from '@/components/ui/CountUp'

const ease = cubicBezier(0.76, 0, 0.24, 1)

const HEADLINE = [
  { text: 'ความสวยงาม', className: 'text-site-dark' },
  { text: 'เริ่มต้น',     className: 'text-site-dark' },
  { text: 'ที่ปลายนิ้ว', className: 'text-sand' },
]

export function HeroSection() {
  return (
    <section
      className="relative grid grid-cols-1 md:grid-cols-2 overflow-hidden"
      style={{ height: 'calc(100vh - 68px - 90px)', minHeight: 520 }}
    >
      {/* Floating blobs */}
      <motion.div
        className="absolute top-[-20%] left-[-8%] w-[480px] h-[480px] rounded-full pointer-events-none select-none"
        style={{ background: 'radial-gradient(circle, rgba(216,177,146,0.2) 0%, transparent 65%)' }}
        animate={{ x: [0, 28, 0], y: [0, -18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-5%] left-[35%] w-[300px] h-[300px] rounded-full pointer-events-none select-none"
        style={{ background: 'radial-gradient(circle, rgba(216,177,146,0.13) 0%, transparent 70%)' }}
        animate={{ x: [0, -22, 0], y: [0, 22, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* LEFT — Text */}
      <div className="flex flex-col justify-center px-10 md:px-20 py-16 gap-5 relative z-10">

        {/* Tag with leading line */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
        >
          <span className="block w-8 h-px bg-sand shrink-0" />
          <span className="text-[10px] font-semibold tracking-[0.28em] uppercase text-site-gray">
            Nail Studio · ดอนหัวฬอ ชลบุรี
          </span>
        </motion.div>

        {/* Headline — line-by-line mask reveal */}
        <div className="flex flex-col gap-0.5">
          {HEADLINE.map((line, i) => (
            <div key={line.text} className="overflow-hidden">
              <motion.h1
                className={`text-5xl md:text-6xl font-bold leading-[1.08] font-serif ${line.className}`}
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.9, ease, delay: 0.22 + i * 0.13 }}
              >
                {line.text}
              </motion.h1>
            </div>
          ))}
        </div>

        <motion.p
          className="text-sm text-site-gray leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.7 }}
        >
          ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น<br />
          วัสดุคุณภาพสูง ช่างมืออาชีพ
        </motion.p>

        {/* CTA */}
        <motion.div
          className="flex items-center gap-7 flex-wrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.85 }}
        >
          <Link
            href="/booking"
            className="rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase px-8 py-3.5 hover:bg-sand-dark transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
          >
            จองนัดเลย
          </Link>
          <Link href="#services" className="text-xs font-semibold tracking-widest uppercase text-sand">
            ดูบริการ →
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex items-center gap-6 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.05 }}
        >
          <div>
            <span className="block text-2xl font-bold text-sand leading-none font-serif">
              <CountUp to={2000} suffix="+" duration={2000} />
            </span>
            <span className="text-[10px] text-site-gray mt-1 tracking-wide">ผู้ติดตาม</span>
          </div>
          <div className="w-px h-8 bg-sand/30" />
          <div>
            <span className="block text-2xl font-bold text-sand leading-none font-serif">5★</span>
            <span className="text-[10px] text-site-gray mt-1 tracking-wide">รีวิวจากลูกค้า</span>
          </div>
          <div className="w-px h-8 bg-sand/30" />
          <div>
            <span className="block text-2xl font-bold text-sand leading-none font-serif">8+</span>
            <span className="text-[10px] text-site-gray mt-1 tracking-wide">ปีประสบการณ์</span>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <motion.span
            className="block h-px bg-sand/50 origin-left"
            style={{ width: 36 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease, delay: 1.5 }}
          />
          <span className="text-[9px] tracking-[0.25em] uppercase text-site-gray">Scroll</span>
        </motion.div>
      </div>

      {/* RIGHT — Pill image + spinning badge + accent */}
      <div className="relative hidden md:flex items-center justify-center">

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease, delay: 0.4 }}
        >
          {/* Main pill image */}
          <div
            className="w-56 h-[360px] overflow-hidden shadow-2xl bg-[#ede0d3]"
            style={{ borderRadius: '140px 140px 16px 16px' }}
          >
            <motion.div
              className="w-full h-full bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800')] bg-center bg-cover"
              initial={{ scale: 1.12 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.8, ease, delay: 0.4 }}
            />
          </div>

          {/* Accent photo — bottom left */}
          <motion.div
            className="absolute -bottom-6 -left-16 w-24 h-32 overflow-hidden shadow-xl"
            style={{ borderRadius: '60px 60px 8px 8px' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.9 }}
          >
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400')] bg-[center_top] bg-cover" />
          </motion.div>

          {/* Spinning circular text badge */}
          <motion.div
            className="absolute -top-4 -right-12 w-[88px] h-[88px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <path id="badgePath" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
              </defs>
              <text fontSize="8.5" fill="#d8b192" letterSpacing="1.5" fontFamily="sans-serif">
                <textPath href="#badgePath">JAPANESE NAIL · STUDIO · CHONBURI ·</textPath>
              </text>
            </svg>
          </motion.div>

          {/* Ghost decorative number */}
          <motion.span
            className="absolute top-1/2 -translate-y-1/2 -right-20 text-[120px] font-bold leading-none select-none pointer-events-none font-serif"
            style={{ color: 'rgba(216,177,146,0.07)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1.3 }}
          >
            01
          </motion.span>
        </motion.div>

        {/* Curtain wipe overlay */}
        <motion.div
          className="absolute inset-0 bg-cream origin-right pointer-events-none"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 1, ease, delay: 0.2 }}
        />
      </div>
    </section>
  )
}
