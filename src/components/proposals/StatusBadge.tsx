import { Badge } from '@/components/ui/badge'
import type { ProposalStatus } from '@/types'

const config: Record<ProposalStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Rascunho', variant: 'secondary' },
  sent: { label: 'Enviada', variant: 'default' },
  approved: { label: 'Aprovada', variant: 'outline' },
}

export function StatusBadge({ status }: { status: ProposalStatus }) {
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
