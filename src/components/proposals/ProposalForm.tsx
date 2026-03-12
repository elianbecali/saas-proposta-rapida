'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Proposal, ProposalStatus } from '@/types'
import { toast } from 'sonner'

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  client_name: z.string().min(1, 'Nome do cliente obrigatório'),
  content: z.string().min(1, 'Conteúdo obrigatório'),
  status: z.enum(['draft', 'sent', 'approved']),
})

type FormData = z.infer<typeof schema>

interface Props {
  proposal?: Proposal
  userId: string
}

export function ProposalForm({ proposal, userId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = !!proposal

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: proposal?.title ?? '',
      client_name: proposal?.client_name ?? '',
      content: proposal?.content ?? '',
      status: proposal?.status ?? 'draft',
    },
  })

  const status = watch('status')

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()

    if (isEditing) {
      const { error } = await supabase
        .from('proposals')
        .update(data)
        .eq('id', proposal.id)
        .eq('user_id', userId)
      if (error) {
        toast.error('Erro ao salvar proposta')
        setLoading(false)
        return
      }
      toast.success('Proposta atualizada!')
      router.push('/proposals')
      router.refresh()
    } else {
      const { error } = await supabase
        .from('proposals')
        .insert({ ...data, user_id: userId })
      if (error) {
        if (error.message.includes('PROPOSAL_LIMIT_REACHED')) {
          toast.error('Limite de propostas atingido. Faça upgrade para PRO.')
        } else {
          toast.error('Erro ao criar proposta')
        }
        setLoading(false)
        return
      }
      toast.success('Proposta criada!')
      router.push('/proposals')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="title">Título da proposta</Label>
          <Input id="title" placeholder="Ex: Desenvolvimento de site institucional" {...register('title')} />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="client_name">Nome do cliente</Label>
          <Input id="client_name" placeholder="Ex: Empresa ABC Ltda" {...register('client_name')} />
          {errors.client_name && <p className="text-sm text-red-500">{errors.client_name.message}</p>}
        </div>
      </div>

      {isEditing && (
        <div className="space-y-1">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setValue('status', value as ProposalStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="sent">Enviada</SelectItem>
              <SelectItem value="approved">Aprovada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="content">Conteúdo da proposta</Label>
        <Textarea
          id="content"
          rows={16}
          placeholder="Descreva os serviços, valores, prazos..."
          className="font-mono text-sm resize-y"
          {...register('content')}
        />
        {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar proposta'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
