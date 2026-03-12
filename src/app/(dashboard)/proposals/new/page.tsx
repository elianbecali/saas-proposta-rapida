import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profiles'
import { getTemplate } from '@/lib/templates'
import { ProposalForm } from '@/components/proposals/ProposalForm'

interface Props {
  searchParams: Promise<{ templateId?: string }>
}

export default async function NewProposalPage({ searchParams }: Props) {
  const { templateId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/login')

  if (profile.plan === 'free') {
    const { count } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((count ?? 0) >= 3) redirect('/proposals')
  }

  let templateContent = ''
  if (templateId) {
    const template = await getTemplate(templateId)
    if (template) templateContent = template.content
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/proposals"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft size={16} /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nova proposta</h1>
      </div>
      <ProposalForm userId={user.id} initialContent={templateContent || undefined} />
    </div>
  )
}
