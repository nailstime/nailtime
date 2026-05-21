import type { Metadata, Viewport } from 'next'
import { Montserrat, Fraunces, Kanit } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

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

const kanit = Kanit({
  subsets: ['thai', 'latin'],
  variable: '--font-thai-modern',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Nail Time & Spa ネイルタイム — ดอนหัวฬอ ชลบุรี',
  description: 'ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น ดอนหัวฬอ ชลบุรี',
  keywords: 'ร้านทำเล็บ,เล็บเจล,ดอนหัวฬอ,ชลบุรี,nail salon',
  metadataBase: new URL('https://nailtimebytt.com'),
  openGraph: {
    title: 'Nail Time & Spa ネイルタイム',
    description: 'ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น ดอนหัวฬอ ชลบุรี',
    locale: 'th_TH',
    type: 'website',
    url: 'https://nailtimebytt.com',
    siteName: 'Nail Time & Spa',
    images: [
      {
        url: '/images/og_image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nail Time & Spa ネイルタイム — ดอนหัวฬอ ชลบุรี',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nail Time & Spa ネイルタイム',
    description: 'ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น',
    images: ['/og.jpg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${montserrat.variable} ${fraunces.variable} ${kanit.variable}`}>
      <body className="font-sans antialiased min-h-full">
        {children}
        {FB_PIXEL_ID && (
          <>
            <Script id="fb-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init','${FB_PIXEL_ID}');
                fbq('track','PageView');
              `}
            </Script>
            <noscript>
              <img height="1" width="1" style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  )
}
