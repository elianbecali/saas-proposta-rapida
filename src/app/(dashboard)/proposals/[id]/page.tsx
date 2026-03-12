import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProposal } from '@/lib/proposals'
import { ProposalForm } from '@/components/proposals/ProposalForm'
import { ExportPdfButton } from '@/components/proposals/ExportPdfButton'
import { StatusBadge } from '@/components/proposals/StatusBadge'
import { Separator } from '@/components/ui/separator'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProposalPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const proposal = await getProposal(id, user.id)
  if (!proposal) notFound()

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link
          href="/proposals"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft size={16} /> Voltar
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-500">{proposal.client_name}</p>
              <StatusBadge status={proposal.status} />
            </div>
          </div>
          <ExportPdfButton title={proposal.title} />
        </div>
      </div>

      <Separator />

      {/* Preview area rendered for PDF export */}
      <div
        id="proposal-preview"
        className="bg-white p-8 rounded-lg border shadow-sm min-h-[400px] whitespace-pre-wrap font-mono text-sm leading-relaxed"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{proposal.title}</h2>
          <p className="text-gray-500">Cliente: {proposal.client_name}</p>
          <p className="text-gray-400 text-xs mt-1">
            {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div>{proposal.content}</div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Editar proposta</h2>
        <ProposalForm proposal={proposal} userId={user.id} />
      </div>
    </div>
  )
}
