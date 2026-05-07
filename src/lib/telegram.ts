const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

function tgFetch(method: string, body: object) {
  if (!TOKEN) return Promise.resolve()
  return fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {})
}

export type BookingNotification = {
  booking_no: string
  guest_name: string
  guest_phone: string | null
  service_name: string
  slot_date: string
  start_time: string
  end_time: string
  note: string | null
}

export async function notifyNewBooking(b: BookingNotification) {
  if (!TOKEN || !CHAT_ID) return

  const date = new Date(b.slot_date + 'T00:00:00').toLocaleDateString('th-TH', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const time = `${b.start_time.slice(0, 5)}–${b.end_time.slice(0, 5)}`

  const lines = [
    `🔔 *การจองใหม่* — \`${b.booking_no}\``,
    `👤 ${b.guest_name}${b.guest_phone ? `  ·  ${b.guest_phone}` : ''}`,
    `💅 ${b.service_name}`,
    `📅 ${date}  ·  ⏰ ${time}`,
    b.note ? `📝 _${b.note}_` : null,
  ].filter(Boolean).join('\n')

  await tgFetch('sendMessage', {
    chat_id: CHAT_ID,
    text: lines,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ ยืนยันคิว', callback_data: `confirm:${b.booking_no}` },
        { text: '❌ ยกเลิก',    callback_data: `cancel:${b.booking_no}` },
      ]],
    },
  })
}

export async function notifyReminder(b: Pick<BookingNotification, 'guest_name' | 'guest_phone' | 'service_name' | 'start_time' | 'end_time'>) {
  if (!TOKEN || !CHAT_ID) return
  const time = `${b.start_time.slice(0, 5)}–${b.end_time.slice(0, 5)}`
  const lines = [
    `⏰ *แจ้งเตือนคิว* — อีก 15 นาที`,
    `👤 ${b.guest_name}${b.guest_phone ? `  ·  ${b.guest_phone}` : ''}`,
    `💅 ${b.service_name}`,
    `🕐 ${time}`,
  ].join('\n')
  await tgFetch('sendMessage', { chat_id: CHAT_ID, text: lines, parse_mode: 'Markdown' })
}

export async function answerCallback(callbackQueryId: string, text: string) {
  return tgFetch('answerCallbackQuery', { callback_query_id: callbackQueryId, text, show_alert: false })
}

export async function editMessageKeyboard(chatId: number, messageId: number, label: string) {
  return tgFetch('editMessageReplyMarkup', {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: { inline_keyboard: [[{ text: label, callback_data: 'noop' }]] },
  })
}
