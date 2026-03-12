import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profiles'
import { getProposals } from '@/lib/proposals'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { FileText, CheckCircle, Send, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, proposals] = await Promise.all([getProfile(user.id), getProposals(user.id)])
  if (!profile) redirect('/login')

  const total = proposals.length
  const drafts = proposals.filter((p) => p.status === 'draft').length
  const sent = proposals.filter((p) => p.status === 'sent').length
  const approved = proposals.filter((p) => p.status === 'approved').length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {profile.name ?? profile.email} 👋
          </h1>
          <p className="text-gray-500 mt-1">Aqui está um resumo das suas propostas</p>
        </div>
        <Link href="/proposals/new" className={buttonVariants()}>
          <Plus size={16} className="mr-2" />
          Nova proposta
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-gray-400" />
              <span className="text-2xl font-bold">{total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rascunhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-yellow-400" />
              <span className="text-2xl font-bold">{drafts}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Send size={20} className="text-blue-400" />
              <span className="text-2xl font-bold">{sent}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-400" />
              <span className="text-2xl font-bold">{approved}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {profile.plan === 'free' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4 flex items-center justify-between">
            <p className="text-sm text-yellow-800">
              Plano Gratuito: {total}/3 propostas utilizadas.{' '}
              {total >= 3 ? 'Você atingiu o limite.' : `Faltam ${3 - total} propostas.`}
            </p>
            <Link href="/settings" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'ml-4')}>
              Fazer upgrade
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
