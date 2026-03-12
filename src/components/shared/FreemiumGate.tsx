import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button-variants'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Plan } from '@/types'

interface Props {
  proposalCount: number
  plan: Plan
}

export function FreemiumGate({ proposalCount, plan }: Props) {
  if (plan === 'pro' || proposalCount < 3) return null

  return (
    <Alert className="border-yellow-300 bg-yellow-50">
      <AlertTriangle size={16} className="text-yellow-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-yellow-800">
          Você atingiu o limite de 3 propostas do plano gratuito.
        </span>
        <Link
          href="/settings"
          className={cn(buttonVariants({ size: 'sm' }), 'ml-4 shrink-0')}
        >
          Fazer upgrade para PRO
        </Link>
      </AlertDescription>
    </Alert>
  )
}
