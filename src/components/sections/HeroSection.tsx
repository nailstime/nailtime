'use client'
import { motion, cubicBezier } from 'framer-motion'
import Link from 'next/link'
import { CountUp } from '@/components/ui/CountUp'

const ease = cubicBezier(0.76, 0, 0.24, 1)

const HEADLINE = [
  { text: 'ความสวยงาม', className: 'text-white' },
  { text: 'เริ่มต้น',     className: 'text-white' },
  { text: 'ที่ปลายนิ้ว', className: 'text-sand' },
]

export function HeroSection() {
  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{ height: 'calc(100vh - 68px)', minHeight: 560 }}
    >
      {/* Background — Ken Burns slow zoom */}
      {/* Replace URL with your own photo for best results */}
      <motion.div
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=1600')] bg-center bg-cover"
        style={{ filter: 'brightness(1.05) saturate(0.75)' }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 9, ease: 'easeOut' }}
      />

      {/* Gradient overlay — lighter to let natural tones show */}
      <div className="absolute inset-0 bg-gradient-to-b from-site-dark/45 via-site-dark/15 to-site-dark/55 pointer-events-none" />

      {/* Spinning badge — bottom right */}
      <motion.div
        className="absolute bottom-28 right-10 w-24 h-24 hidden md:block z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, rotate: 360 }}
        transition={{
          opacity: { duration: 1, delay: 1.3 },
          rotate: { duration: 16, repeat: Infinity, ease: 'linear' },
        }}
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

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-5 px-6 max-w-4xl w-full -mt-8">

        {/* Brand name — prominent */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.15 }}
        >
          <span className="text-2xl md:text-3xl font-light tracking-[0.55em] uppercase text-white/95 drop-shadow-sm">
            Nail Time Studio
          </span>
          <div className="flex items-center gap-3">
            <span className="block w-6 h-px bg-sand/60 shrink-0" />
            <span className="text-[9px] tracking-[0.3em] uppercase text-white/55">
              ดอนหัวฬอ · ชลบุรี
            </span>
            <span className="block w-6 h-px bg-sand/60 shrink-0" />
          </div>
        </motion.div>

        {/* Headline — line-by-line mask reveal, smaller */}
        <div className="flex flex-col items-center gap-0">
          {HEADLINE.map((line, i) => (
            <div key={line.text} className="overflow-hidden">
              <motion.h1
                className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] font-serif ${line.className}`}
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.9, ease, delay: 0.3 + i * 0.13 }}
              >
                {line.text}
              </motion.h1>
            </div>
          ))}
        </div>

        {/* Subtext */}
        <motion.p
          className="text-sm text-white/60 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.75 }}
        >
          ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น · วัสดุคุณภาพสูง ช่างมืออาชีพ
        </motion.p>

        {/* CTA */}
        <motion.div
          className="flex items-center gap-6 flex-wrap justify-center mt-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.9 }}
        >
          <Link
            href="/booking"
            className="rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase px-9 py-3.5 hover:bg-sand-dark transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
          >
            จองนัดเลย
          </Link>
          <Link
            href="#services"
            className="text-xs font-semibold tracking-widest uppercase text-white/75 hover:text-sand transition-colors"
          >
            ดูบริการ →
          </Link>
        </motion.div>
      </div>

      {/* Stats bar — pinned to bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-10 px-6 py-5 border-t border-white/10 bg-site-dark/40 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 1.1 }}
      >
        <div className="text-center">
          <span className="block text-xl font-bold text-sand leading-none font-serif">
            <CountUp to={2000} suffix="+" duration={2000} />
          </span>
          <span className="text-[10px] text-white/50 mt-1 tracking-wide block">ผู้ติดตาม</span>
        </div>

        <div className="w-px h-8 bg-white/15" />

        <div className="text-center">
          <span className="block text-xl font-bold text-sand leading-none font-serif">5★</span>
          <span className="text-[10px] text-white/50 mt-1 tracking-wide block">รีวิวจากลูกค้า</span>
        </div>

        <div className="w-px h-8 bg-white/15" />

        <div className="text-center">
          <span className="block text-xl font-bold text-sand leading-none font-serif">8+</span>
          <span className="text-[10px] text-white/50 mt-1 tracking-wide block">ปีประสบการณ์</span>
        </div>

        {/* Scroll indicator */}
        <div className="absolute right-8 flex items-center gap-2 hidden md:flex">
          <motion.span
            className="block h-px bg-white/35 origin-left"
            style={{ width: 32 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease, delay: 1.6 }}
          />
          <span className="text-[9px] tracking-[0.25em] uppercase text-white/40">Scroll</span>
        </div>
      </motion.div>
    </section>
  )
}
