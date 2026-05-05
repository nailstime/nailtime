'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    // Update phone in profile
    const { data: { user } } = await supabase.auth.getUser()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (user) await (supabase.from('profiles') as any).update({ phone: form.phone }).eq('id', user.id)
    router.push('/booking')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center font-bold text-2xl text-site-dark mb-8">
          Nail Time <span className="text-sand">&amp; Spa</span>
        </Link>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-sand/20">
          <h1 className="text-xl font-bold mb-6">สมัครสมาชิก</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { key: 'full_name', label: 'ชื่อ-นามสกุล', type: 'text' },
              { key: 'phone',    label: 'เบอร์โทรศัพท์', type: 'tel' },
              { key: 'email',    label: 'อีเมล',          type: 'email' },
              { key: 'password', label: 'รหัสผ่าน',       type: 'password' },
            ].map(({ key, label, type }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-site-gray">{label}</label>
                <input type={type} required value={form[key as keyof typeof form]}
                  onChange={e => set(key, e.target.value)}
                  className="border border-sand/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-sand transition-colors" />
              </div>
            ))}
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading}
              className="rounded-full bg-sand text-white text-xs font-medium tracking-widest uppercase py-3.5 hover:bg-sand-dark transition-all disabled:opacity-50 mt-2">
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>
          <p className="text-center text-sm text-site-gray mt-6">
            มีบัญชีแล้ว?{' '}
            <Link href="/login" className="text-sand font-semibold">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
