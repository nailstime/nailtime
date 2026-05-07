import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { answerCallback, editMessageKeyboard } from '@/lib/telegram'

export async function POST(request: Request) {
  const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const body = await request.json()
  const callback = body.callback_query
  if (!callback) return NextResponse.json({ ok: true })

  const data: string = callback.data ?? ''
  const [action, bookingNo] = data.split(':')

  if (!bookingNo || (action !== 'confirm' && action !== 'cancel')) {
    await answerCallback(callback.id, '—')
    return NextResponse.json({ ok: true })
  }

  const status = action === 'confirm' ? 'confirmed' : 'cancelled'
  const label  = action === 'confirm' ? '✅ ยืนยันแล้ว' : '❌ ยกเลิกแล้ว'

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('bookings') as any).update({ status }).eq('booking_no', bookingNo)

  await Promise.all([
    answerCallback(callback.id, label),
    editMessageKeyboard(callback.message.chat.id, callback.message.message_id, label),
  ])

  return NextResponse.json({ ok: true })
}
