'use client'
import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); setLoading(false); return }
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-sand/20">
      <h1 className="text-xl font-bold mb-6">เข้าสู่ระบบ</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-site-gray">อีเมล</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="border border-sand/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-sand transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-site-gray">รหัสผ่าน</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="border border-sand/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-sand transition-colors" />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button type="submit" disabled={loading}
          className="rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase py-3.5 hover:bg-sand-dark transition-all disabled:opacity-50 mt-2">
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
      <p className="text-center text-sm text-site-gray mt-6">
        ยังไม่มีบัญชี?{' '}
        <Link href="/register" className="text-sand font-semibold">สมัครสมาชิก</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center font-bold text-2xl text-site-dark mb-8">
          Nail Time <span className="text-sand">&amp; Spa</span>
        </Link>
        <Suspense fallback={<div className="bg-white rounded-2xl p-8 shadow-sm border border-sand/20 h-64 animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
