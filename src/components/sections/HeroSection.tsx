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
      style={{ height: 'calc(100vh - 68px - 90px)', minHeight: 590 }}
    >
      {/* Full-width background image */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.025 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      >
        <Image
          src="/images/hero.webp"
          alt="Nail Time Studio"
          fill
          className="object-cover object-[50%_50%]"
          sizes="100vw"
          priority
        />
      </motion.div>

      {/* Left gradient — minimal so leaf shadow shows through */}
      <div className="absolute inset-0 bg-gradient-to-r from-cream/80 via-cream/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/18 via-transparent to-cream/10 pointer-events-none" />

      {/* Text content — left side overlay */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 py-10 text-center md:w-[48%] md:px-12 lg:px-20">
        <div className="flex max-w-[520px] flex-col items-center gap-5">

        {/* Brand */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
        >
          <span className="text-lg font-medium tracking-[0.44em] text-site-dark/85 uppercase whitespace-nowrap md:text-xl lg:text-2xl">
            Nail Time Studio
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="block w-6 h-px bg-sand/55 shrink-0" />
            <span className="text-[9px] tracking-[0.3em] uppercase text-site-gray">
              ดอนหัวฬอ · ชลบุรี
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <div className="flex flex-col items-center gap-0">
          {HEADLINE.map((line, i) => (
            <div key={line.text} className="overflow-hidden">
              <motion.h1
                className={`text-[2.65rem] sm:text-5xl md:text-[3.3rem] lg:text-[3.75rem] font-bold leading-[1.08] font-serif ${line.className}`}
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
          className="max-w-md text-sm md:text-[15px] text-site-gray leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.7 }}
        >
          ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น<br />
          วัสดุคุณภาพสูง ช่างมืออาชีพ
        </motion.p>

        {/* CTA */}
        <motion.div
          className="flex items-center justify-center gap-4 flex-wrap"
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
          className="mt-2 flex w-full max-w-[520px] items-center justify-center gap-0 overflow-hidden rounded-none border border-sand/20 bg-cream/18 py-5 shadow-[0_12px_36px_rgba(89,64,38,0.05)] backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.0 }}
        >
          <div className="flex-1 px-4">
            <span className="block text-2xl font-bold text-sand-dark leading-none font-serif">
              <CountUp to={2000} suffix="+" duration={2000} />
            </span>
            <span className="text-[10px] text-site-gray mt-1 tracking-wide block">ผู้ติดตาม</span>
          </div>
          <div className="w-px h-12 bg-sand/25" />
          <div className="flex-1 px-4">
            <span className="block text-2xl font-bold text-sand-dark leading-none font-serif">5★</span>
            <span className="text-[10px] text-site-gray mt-1 tracking-wide block">รีวิวจากลูกค้า</span>
          </div>
          <div className="w-px h-12 bg-sand/25" />
          <div className="flex-1 px-4">
            <span className="block text-2xl font-bold text-sand-dark leading-none font-serif">8+</span>
            <span className="text-[10px] text-site-gray mt-1 tracking-wide block">ปีประสบการณ์</span>
          </div>
        </motion.div>
        </div>
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
