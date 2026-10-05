import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, MoveUpRight, Plus } from 'lucide-react'
import { SiteNav } from './SiteNav'
import { StoryHero } from './StoryHero'
import { GelStudio } from './studio/GelStudio'
import { Parallax } from './Parallax'
import { WorksGallery } from './WorksGallery'
import { ServiceMenu } from './ServiceMenu'
import { HomeBookingBar } from '../booking/HomeBookingBar'
import { LineCouponForm } from '../sections/LineCouponForm'
import { SHOP } from './data'
import { anuphan, shippori } from './fonts'
import { EditorialMotion, ScrollProgress } from './EditorialMotion'
import base from './site.module.css'
import s from './editorial.module.css'

type Service = { id: string; name: string; description: string | null; duration: number; price: number | null }

export function EditorialHome({ services }: { services: Service[] }) {
  return (
    <div className={`${base.root} ${s.page} ${anuphan.variable} ${shippori.variable}`}>
      <ScrollProgress />
      <SiteNav />
      <a className={s.skip} href="#main-content">ข้ามไปเนื้อหาหลัก</a>
      <main id="main-content" tabIndex={-1}>
        <StoryHero />

        <section id="story" className={s.intro}>
          <div className={s.sectionLabel}><span>01 — THE PHILOSOPHY</span><span>私たちの想い</span></div>
          <div className={s.introGrid}>
            <Parallax amount={35} className={s.introPhoto}><Image src="/images/portfolio/1.webp" alt="รายละเอียดลายผีเสื้อและหัวใจบนเล็บลูกค้าของ Nail Time" fill sizes="(min-width: 900px) 20vw, 36vw" className={s.cover} /><span>MADE WITH A LITTLE LOVE.</span></Parallax>
            <div><h2 className={`${s.statement} ${s.storyStatement}`}>FROM A SMALL<br />NAIL STUDIO,<br /><em>TO A PLACE MADE<br />FOR YOUR TIME.</em></h2><div className={s.introText}><span className={s.smallFlower} aria-hidden="true">✳</span><p>จากสตูดิโอเล็บเล็ก ๆ สู่พื้นที่สำหรับเวลาของคุณ<br />เราเชื่อว่าการทำเล็บคือเวลาที่คุณได้กลับมาดูแลตัวเอง เลือกสีที่ชอบ ลายที่ใช่ แล้วออกไปใช้วันของคุณด้วยความรู้สึกดี</p></div></div>
          </div>
        </section>

        <section id="studio" className={s.studioChapter} aria-labelledby="studio-title">
          <div className={s.studioSticky}>
            <div className={s.sectionLabel}><span>02 — THE COLOR PLAYGROUND</span><span>SCROLL. ROTATE. MAKE IT YOURS.</span></div>
            <div className={s.studioGrid}>
              <div className={s.studioCopy}><span className={s.eyebrow}>YOUR MOOD, IN COLOR</span><h2 id="studio-title" className={s.sectionTitle}>Find your<br /><em>kind of color.</em></h2><p>วันนี้คุณเป็นสีอะไร?<br />ลองเลือกสีและผิวสัมผัสบนเล็บ 3 มิติ<br />แล้วเก็บไอเดียที่ชอบมาคุยกับช่าง</p><a href="#menu" className={s.textLink}>ค้นหาบริการที่ใช่ <ArrowUpRight size={17} /></a><span className={s.studioNote}><ArrowDown size={15} /> เลื่อนเพื่อดูรายละเอียด · ลากเพื่อหมุน</span></div>
              <div className={s.studioCanvas}><GelStudio /></div>
            </div>
          </div>
        </section>

        <section id="works" className={s.works}>
          <div className={s.sectionLabel}><span>03 — SELECTED WORK</span><span>HANDCRAFTED, NEVER THE SAME.</span></div>
          <div className={s.sectionHeading}><h2 className={s.sectionTitle}>Little canvases.<br /><em>Endless possibilities.</em></h2><div><p>ผลงานจริงจากมือช่างของเรา<br />ทุกรายละเอียด ตั้งใจให้เป็นคุณ</p><a className={s.textLink} href={SHOP.instagram} target="_blank" rel="noopener noreferrer">EXPLORE INSTAGRAM <ArrowUpRight size={17} /></a></div></div>
          <div className={s.gallery}><WorksGallery /></div>
          <div className={s.galleryFoot}><span>เลือกภาพเพื่อดูรายละเอียด</span><span>NAIL TIME & SPA — THE PORTFOLIO</span></div>
        </section>

        <section id="services" className={s.ritual}>
          <div className={s.ritualVisual}><EditorialMotion amount={65} className={s.ritualImage}><Image src="/images/portfolio/3.webp" alt="งานทำเล็บและรายละเอียดการตกแต่งโดยช่าง Nail Time" fill sizes="(min-width: 900px) 50vw, 100vw" className={s.cover} /></EditorialMotion><span className={s.ritualStamp}>GOOD NAILS.<br /><em>Good mood.</em></span></div>
          <div className={s.ritualCopy}><span className={s.eyebrow}>04 — THE NAIL TIME RITUAL</span><h2 className={s.sectionTitle}>Slow down.<br /><em>We’ll take care.</em></h2><p>วางเรื่องวุ่น ๆ ไว้สักพัก<br />แล้วให้เราดูแลรายละเอียดที่เหลือ</p>{[['01', 'Your style', 'คุยเรื่องสี ลาย และรูปทรงที่เข้ากับคุณ'], ['02', 'Our care', 'เตรียมหน้าเล็บและดูแลผิวรอบเล็บอย่างใส่ใจ'], ['03', 'A little art', 'ลงสีและเก็บรายละเอียด ให้ทุกมุมสวยในแบบคุณ']].map(([n, title, detail]) => <div key={n} className={s.ritualStep}><span>{n}</span><div><h3>{title}</h3><p>{detail}</p></div><Plus size={17} strokeWidth={1} /></div>)}</div>
        </section>

        <section id="menu" className={s.menu}>
          <div className={s.sectionLabel}><span>05 — THE TREATMENT MENU</span><span>A MOMENT WELL SPENT.</span></div>
          <div className={s.menuGrid}><div><h2 className={s.sectionTitle}>A little care.<br /><em>A lovely change.</em></h2><p>เลือกบริการที่ต้องการ แล้วเลือกวันและเวลา<br />ราคาขึ้นอยู่กับความยาวเล็บและรายละเอียดลาย</p><a className={s.textLink} href={SHOP.line} target="_blank" rel="noopener noreferrer">ปรึกษาลายที่ชอบทาง LINE <ArrowUpRight size={17} /></a></div><ServiceMenu services={services} /></div>
          <div className={s.booking}><span className={s.eyebrow}>MAKE SOME TIME FOR YOURSELF</span><HomeBookingBar /></div>
        </section>

        <section className={s.offer}><span className={s.smallFlower} aria-hidden="true">✳</span><div><span className={s.eyebrow}>A LITTLE HELLO, FROM US</span><h2>ครั้งแรกของคุณ <em>พิเศษเสมอ</em></h2><p>รับส่วนลด 50 บาทสำหรับการทำเล็บครั้งแรก<br />ลงทะเบียน แล้วเพิ่มเพื่อน LINE เพื่อรับสิทธิ์</p></div><div className={s.offerForm}><LineCouponForm /></div></section>

        <section id="visit" className={s.visit}>
          <div className={s.sectionLabel}><span>06 — SEE YOU AT THE STUDIO</span><span>ดอนหัวฬอ, ชลบุรี</span></div>
          <div className={s.visitHeadline}><h2>Your next<br /><em>happy place.</em></h2><Link href="/booking" className={s.visitBook} aria-label="จองคิวออนไลน์"><MoveUpRight strokeWidth={1} /><span>BOOK YOUR VISIT</span></Link></div>
          <div className={s.visitDetails}><div><span>FIND US</span><p>ตรงข้ามที่ทำการเทศบาลดอนหัวฬอ<br />เมืองชลบุรี, ชลบุรี</p><a href={SHOP.maps} target="_blank" rel="noopener noreferrer">เปิดแผนที่ <ArrowUpRight size={15} /></a></div><div><span>YOUR TIME</span><p>เปิดทุกวัน<br />09:00 — 19:00 น.</p><a href={SHOP.tel}>{SHOP.phone} <ArrowUpRight size={15} /></a></div><div><span>SAY HELLO</span><a href={SHOP.line} target="_blank" rel="noopener noreferrer">LINE <ArrowUpRight size={15} /></a><a href={SHOP.instagram} target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight size={15} /></a><a href={SHOP.facebook} target="_blank" rel="noopener noreferrer">Facebook <ArrowUpRight size={15} /></a></div></div>
        </section>
      </main>
      <footer className={s.footer}><div className={s.wordmark}>nail time<span>®</span></div><div className={s.footerBottom}><span>© {new Date().getFullYear()} NAIL TIME & SPA</span><span>MADE FOR YOUR LITTLE MOMENTS.</span><Link href="/booking/status">เช็กสถานะการจอง <ArrowUpRight size={14} /></Link></div></footer>
    </div>
  )
}
