'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmedContent() {
  const searchParams = useSearchParams()
  const bookingNo = searchParams.get('no') ?? ''
  const service = searchParams.get('service') ?? ''
  const date = searchParams.get('date') ?? ''
  const time = searchParams.get('time') ?? ''
  const name = searchParams.get('name') ?? ''

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-site-dark mb-2">จองสำเร็จ!</h1>
        <p className="text-site-gray mb-1">หมายเลขการจอง</p>
        <p className="text-2xl font-bold text-sand mb-6">{bookingNo}</p>

        {(service || date || time || name) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand/20 text-left mb-6 space-y-3 text-sm">
            {service && (
              <div className="flex justify-between gap-4">
                <span className="text-site-gray">บริการ</span>
                <span className="font-medium text-right">{service}</span>
              </div>
            )}
            {date && (
              <div className="flex justify-between">
                <span className="text-site-gray">วันที่</span>
                <span className="font-medium">{date}</span>
              </div>
            )}
            {time && (
              <div className="flex justify-between">
                <span className="text-site-gray">เวลา</span>
                <span className="font-medium">{time} น.</span>
              </div>
            )}
            {name && (
              <div className="flex justify-between">
                <span className="text-site-gray">ชื่อ</span>
                <span className="font-medium">{name}</span>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-site-gray mb-6">
          กรุณาตรงต่อเวลา หากต้องการยกเลิกกรุณาแจ้งล่วงหน้า 2 ชั่วโมง
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/booking/status"
            className="block rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase py-3.5 text-center hover:bg-sand-dark transition-all"
          >
            ตรวจสอบคิวนัด
          </Link>
          <Link
            href="/"
            className="block rounded-full border border-sand/40 text-sand text-xs font-medium tracking-widest uppercase py-3.5 text-center hover:bg-sand/5 transition-all"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BookingConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <ConfirmedContent />
    </Suspense>
  )
}
