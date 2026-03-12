'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FileText, LayoutDashboard, LogOut, Settings, Layers } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/proposals', label: 'Propostas', icon: FileText },
  { href: '/templates', label: 'Templates', icon: Layers },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

interface Props {
  profile: Profile
}

export function Sidebar({ profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b">
        <h1 className="font-bold text-lg text-gray-900">Proposta Rápida</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t space-y-3">
        <div className="px-3">
          <p className="text-sm font-medium text-gray-900 truncate">{profile.name ?? profile.email}</p>
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              profile.plan === 'pro'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {profile.plan === 'pro' ? 'PRO' : 'Gratuito'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 w-full text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
