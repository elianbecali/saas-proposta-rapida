'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportProposalAsPdf } from '@/lib/pdf'
import { toast } from 'sonner'

interface Props {
  title: string
}

export function ExportPdfButton({ title }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      await exportProposalAsPdf('proposal-preview', title)
    } catch {
      toast.error('Erro ao exportar PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      <Download size={16} className="mr-2" />
      {loading ? 'Gerando PDF...' : 'Exportar PDF'}
    </Button>
  )
}
