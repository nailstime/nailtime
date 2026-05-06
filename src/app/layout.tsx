import type { Metadata } from 'next'
import { Montserrat, Fraunces } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '900'],
})

export const metadata: Metadata = {
  title: 'Nail Time & Spa ネイルタイム — ดอนหัวฬอ ชลบุรี',
  description: 'ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น ดอนหัวฬอ ชลบุรี',
  keywords: 'ร้านทำเล็บ,เล็บเจล,ดอนหัวฬอ,ชลบุรี,nail salon',
  openGraph: {
    title: 'Nail Time & Spa ネイルタイム',
    description: 'ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น',
    locale: 'th_TH',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${montserrat.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased min-h-full">{children}</body>
    </html>
  )
}
