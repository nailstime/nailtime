import type { Finish } from './studio/NailScene'

export const SHOP = {
  phone: '064 745 1946',
  tel: 'tel:0647451946',
  line: 'https://line.me/ti/p/~nailtimetk22',
  lineId: '@nailtimetk22',
  instagram: 'https://www.instagram.com/nail_time_bytt/',
  instagramHandle: '@nail_time_bytt',
  facebook:
    'https://www.facebook.com/p/Nail-Time-Spa-%E3%83%8D%E3%82%A4%E3%83%AB%E3%82%BF%E3%82%A4%E3%83%A0-100065117245969/',
  maps: 'https://maps.app.goo.gl/m6ivA9WGWFaRu6MRA',
  mapEmbed:
    'https://maps.google.com/maps?q=C2CM%2BQW+Don+Hua+Lo,+Chon+Buri+District,+Chon+Buri&output=embed&hl=th&z=17',
  hours: '09:00 – 19:00',
}

// Sample shades for the try-on studio. The salon mixes to match on the day.
export const SHADES = [
  { id: 'milk', name: 'Milk Beige', th: 'มิลค์เบจ', hex: '#e8d5c2' },
  { id: 'sakura', name: 'Sakura', th: 'ซากุระ', hex: '#efc2c0' },
  { id: 'rose', name: 'Rose Mauve', th: 'โรสมอฟ', hex: '#c38b8a' },
  { id: 'latte', name: 'Latte', th: 'ลาเต้', hex: '#b58865' },
  { id: 'cherry', name: 'Cherry Wine', th: 'เชอร์รี่ไวน์', hex: '#7c1c2b' },
  { id: 'matcha', name: 'Matcha Milk', th: 'มัทฉะ', hex: '#a9b799' },
  { id: 'mist', name: 'Blue Mist', th: 'บลูมิสต์', hex: '#b5c4d4' },
  { id: 'kuro', name: 'Kuro', th: 'คุโระ', hex: '#27252b' },
] as const

export const FINISH_OPTIONS: { id: Finish; th: string; en: string }[] = [
  { id: 'gloss', th: 'เจลเงา', en: 'Gloss' },
  { id: 'matte', th: 'ด้าน', en: 'Matte' },
  { id: 'glitter', th: 'กากเพชร', en: 'Glitter' },
  { id: 'chrome', th: 'ออโรร่า', en: 'Aurora' },
]

export const REVIEWS = [
  {
    name: 'คุณนุ่น',
    date: 'เมษายน 2026',
    text: 'ทำเล็บสวยมากค่ะ ช่างใจเย็น พูดคุยง่าย สีออกมาตรงใจเลย ครั้งหน้าจะมาอีกแน่นอน',
  },
  {
    name: 'คุณแอน',
    date: 'มีนาคม 2026',
    text: 'ร้านสะอาดมาก อุปกรณ์ใหม่เอี่ยม เล็บอยู่ทนมากกว่า 3 สัปดาห์ ไม่หลุดเลยค่ะ แนะนำเลย',
  },
  {
    name: 'คุณฝน',
    date: 'กุมภาพันธ์ 2026',
    text: 'มาทำทั้งมือและเท้า ช่างฝีมือดีมาก ลายที่ขอมาออกมาสวยเกินคาด ประทับใจมากๆ ค่ะ',
  },
]

export const PILLARS = [
  { jp: 'ケア', en: 'Nail Care', th: 'ดูแลเล็บมือเท้าครบครัน ทำความสะอาด ตกแต่งผิว ก่อนลงสีทุกครั้ง' },
  { jp: 'アート', en: 'Nail Art', th: 'เพ้นท์ลายอิสระสไตล์ญี่ปุ่น ลาย custom ตามรูปที่ชอบได้ทุกแบบ' },
  { jp: 'トレンド', en: 'Tips & Trends', th: 'อัปเดตเทรนด์ใหม่ทุกซีซั่น ช่างช่วยแนะนำสีและลายที่เข้ากับมือคุณ' },
]

export const WORKS = [1, 2, 3, 4, 5, 6].map((n) => `/images/portfolio/${n}.webp`)
export const CATALOG = Array.from({ length: 11 }, (_, i) => `/images/catalog/${i + 1}.webp`)

export const POLISHES = [
  { src: '/images/bottle-base.png', name: 'Base Coat', sub: 'Film shadow / No.5 oz' },
  { src: '/images/bottle-gel.png', name: 'Gel Polish', sub: 'Sorbet fine / No.5 oz' },
  { src: '/images/bottle-top.png', name: 'Top Coat', sub: 'Summer mirage / No.5 oz' },
  { src: '/images/bottle-matte.png', name: 'Matte Polish', sub: 'Blue Paletts / No.5 oz' },
]
