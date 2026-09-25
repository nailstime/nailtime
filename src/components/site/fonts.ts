import { Anuphan, Shippori_Mincho } from 'next/font/google'

// Scoped to the public homepage only; booking and admin keep the root layout fonts.
export const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  variable: '--font-nt-body',
  display: 'swap',
})

// Japanese accents (ネイルタイム). Glyphs are fetched on demand, so no preload.
export const shippori = Shippori_Mincho({
  weight: ['500'],
  variable: '--font-nt-jp',
  display: 'swap',
  preload: false,
})
