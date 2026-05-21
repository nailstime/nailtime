'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 11.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 5.76 5.76l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function LineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}

const CONTACTS = [
  {
    label: 'โทร',
    href: 'tel:0647451946',
    icon: <PhoneIcon />,
    color: 'hover:text-sand',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/p/Nail-Time-Spa-%E3%83%8D%E3%82%A4%E3%83%AB%E3%82%BF%E3%82%A4%E3%83%A0-100065117245969/',
    icon: <FacebookIcon />,
    color: 'hover:text-[#1877f2]',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/nail_time_bytt',
    icon: <InstagramIcon />,
    color: 'hover:text-[#e1306c]',
  },
  {
    label: 'LINE',
    href: 'https://line.me/ti/p/~nailtimetk22',
    icon: <LineIcon />,
    color: 'hover:text-[#06c755]',
  },
]

export function FloatingCTA() {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 md:bottom-5 md:left-auto md:right-5 md:w-auto"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between gap-2 border-t border-sand/15 bg-white/96 px-2 py-2.5 shadow-[0_-1px_20px_rgba(0,0,0,0.08)] backdrop-blur-md sm:px-4 md:gap-3 md:rounded-2xl md:border md:border-sand/20 md:px-5 md:shadow-[0_8px_32px_rgba(0,0,0,0.13)]">

        {/* Contact icons */}
        <div className="flex min-w-0 flex-1 items-center justify-around md:flex-none">
          {CONTACTS.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-site-dark/60 transition-colors sm:px-3 ${c.color}`}
            >
              {c.icon}
              <span className="text-[8px] tracking-wide">{c.label}</span>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-sand/25 shrink-0" />

        {/* Booking button */}
        <Link
          href="/booking"
          className="shrink-0 rounded-full bg-sand px-4 py-2.5 text-xs font-medium tracking-widest text-white uppercase whitespace-nowrap transition-all hover:bg-sand-dark hover:shadow-md active:scale-95 sm:px-5"
        >
          จองคิว
        </Link>
      </div>
    </motion.div>
  )
}
