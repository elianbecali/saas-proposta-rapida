import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profiles'
import { getProposals } from '@/lib/proposals'
import { ProposalCard } from '@/components/proposals/ProposalCard'
import { FreemiumGate } from '@/components/shared/FreemiumGate'
import { buttonVariants } from '@/components/ui/button-variants'
import { Plus, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function ProposalsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, proposals] = await Promise.all([getProfile(user.id), getProposals(user.id)])
  if (!profile) redirect('/login')

  const isBlocked = profile.plan === 'free' && proposals.length >= 3

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Propostas</h1>
        {isBlocked ? (
          <span className={cn(buttonVariants(), 'opacity-50 cursor-not-allowed pointer-events-none')}>
            <Plus size={16} className="mr-2" />
            Nova proposta
          </span>
        ) : (
          <Link href="/proposals/new" className={buttonVariants()}>
            <Plus size={16} className="mr-2" />
            Nova proposta
          </Link>
        )}
      </div>

      <FreemiumGate proposalCount={proposals.length} plan={profile.plan} />

      {proposals.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhuma proposta ainda</p>
          <p className="text-sm mt-1">Crie sua primeira proposta agora</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  )
}
