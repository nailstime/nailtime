'use client'
import { motion, cubicBezier } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
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
      className="relative overflow-hidden"
      style={{ height: 'calc(100vh - 68px)', minHeight: 560 }}
    >
      {/* Full-width background image */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.06 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      >
        <Image
          src="/images/hero.webp"
          alt="Nail Time Studio"
          fill
          className="object-cover object-center"
          priority
        />
      </motion.div>

      {/* Left gradient — light enough to show leaf shadow, dark enough for text */}
      <div className="absolute inset-0 bg-gradient-to-r from-cream/80 via-cream/45 to-transparent pointer-events-none" />

      {/* Text content — left side overlay */}
      <div className="relative z-10 flex flex-col justify-center h-full px-10 md:px-20 lg:px-28 py-16 max-w-[600px] gap-5">

        {/* Brand */}
        <motion.div
          className="flex flex-col gap-1.5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
        >
          <span className="text-xl md:text-2xl font-light tracking-[0.5em] uppercase text-site-dark/80">
            Nail Time Studio
          </span>
          <div className="flex items-center gap-2.5">
            <span className="block w-5 h-px bg-sand/50 shrink-0" />
            <span className="text-[9px] tracking-[0.3em] uppercase text-site-gray">
              ดอนหัวฬอ · ชลบุรี
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <div className="flex flex-col gap-0">
          {HEADLINE.map((line, i) => (
            <div key={line.text} className="overflow-hidden">
              <motion.h1
                className={`text-5xl md:text-6xl font-bold leading-[1.1] font-serif ${line.className}`}
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.9, ease, delay: 0.2 + i * 0.13 }}
              >
                {line.text}
              </motion.h1>
            </div>
          ))}
        </div>

        {/* Subtext */}
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
          className="flex items-center gap-4 flex-wrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.85 }}
        >
          <Link
            href="/booking"
            className="rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase px-7 py-3.5 hover:bg-sand-dark transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            จองนัดเลย
          </Link>
          <Link
            href="#services"
            className="rounded-full border border-sand/40 text-xs font-medium tracking-widest uppercase px-7 py-3.5 text-sand-dark hover:border-sand hover:bg-sand/5 transition-all"
          >
            ดูบริการ →
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex items-center gap-6 pt-5 border-t border-sand/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.0 }}
        >
          <div>
            <span className="block text-xl font-bold text-sand leading-none font-serif">
              <CountUp to={2000} suffix="+" duration={2000} />
            </span>
            <span className="text-[10px] text-site-gray mt-1 tracking-wide block">ผู้ติดตาม</span>
          </div>
          <div className="w-px h-8 bg-sand/25" />
          <div>
            <span className="block text-xl font-bold text-sand leading-none font-serif">5★</span>
            <span className="text-[10px] text-site-gray mt-1 tracking-wide block">รีวิวจากลูกค้า</span>
          </div>
          <div className="w-px h-8 bg-sand/25" />
          <div>
            <span className="block text-xl font-bold text-sand leading-none font-serif">8+</span>
            <span className="text-[10px] text-site-gray mt-1 tracking-wide block">ปีประสบการณ์</span>
          </div>
        </motion.div>
      </div>

      {/* Spinning circular badge — bottom right */}
      <motion.div
        className="absolute bottom-10 right-8 w-24 h-24 z-20 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, rotate: 360 }}
        transition={{
          opacity: { duration: 1, delay: 1.2 },
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
    </section>
  )
}
