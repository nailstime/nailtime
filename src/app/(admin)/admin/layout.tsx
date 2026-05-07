import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/bookings', label: 'การจอง' },
  { href: '/admin/services', label: 'บริการ' },
  { href: '/admin/slots', label: 'เวลาว่าง' },
  { href: '/admin/seo', label: 'SEO' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null; error: unknown }
  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-site-dark text-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-bold opacity-80 hover:opacity-100">Nail Time Admin</Link>
            <nav className="hidden sm:flex items-center gap-4">
              {NAV.map(n => (
                <Link key={n.href} href={n.href}
                  className="text-xs text-white/70 hover:text-white transition-colors font-medium uppercase tracking-wide">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-xs text-white/60 hover:text-white transition-colors">ออกจากระบบ</button>
          </form>
        </div>
        {/* Mobile nav */}
        <div className="sm:hidden border-t border-white/10 px-6 py-2 flex gap-4 overflow-x-auto">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className="text-xs text-white/70 hover:text-white whitespace-nowrap">{n.label}</Link>
          ))}
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">{children}</main>
    </div>
  )
}
