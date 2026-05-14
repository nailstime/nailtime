'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const LINE_ADD_FRIEND = 'https://line.me/ti/p/~nailtimetk22'

type State = 'idle' | 'loading' | 'done' | 'error'

export function LineCouponForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState<State>('idle')

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) return
    setState('loading')
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('leads').insert({ name: name.trim(), phone: phone.trim() })
      if (error) throw error
      setState('done')
      window.open(LINE_ADD_FRIEND, '_blank', 'noopener,noreferrer')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
        <div className="flex items-center gap-2 text-[#06c755]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-sm font-medium">ลงทะเบียนสำเร็จ!</span>
        </div>
        <a
          href={LINE_ADD_FRIEND}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-[#06c755] text-white text-xs font-medium uppercase tracking-widest px-6 py-3 hover:opacity-90 transition-opacity active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
          เพิ่มเพื่อน LINE OA
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="flex flex-col gap-3 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-3 border border-white/20 rounded-full bg-white/8 focus-within:border-sand/60 transition-colors pl-5 pr-1.5 py-1.5">
        <input
          type="text"
          placeholder="ชื่อ"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-20 bg-transparent outline-none text-sm text-white placeholder:text-white/40 shrink-0"
        />
        <span className="text-white/20 shrink-0">|</span>
        <input
          type="tel"
          placeholder="เบอร์โทรศัพท์"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          className="flex-1 min-w-0 bg-transparent outline-none text-sm text-white placeholder:text-white/40"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="shrink-0 text-xs font-bold uppercase tracking-widest text-site-dark bg-sand hover:bg-sand-dark transition-colors disabled:opacity-50 px-5 py-2.5 rounded-full"
        >
          {state === 'loading' ? '...' : 'รับคูปอง'}
        </button>
      </div>
      {state === 'error' && (
        <p className="text-xs text-red-400 text-center">เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</p>
      )}
    </form>
  )
}
