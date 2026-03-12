import { createClient } from '@/lib/supabase/server'
import type { Proposal, Plan } from '@/types'

const FREE_PLAN_LIMIT = 3

export async function getProposals(userId: string): Promise<Proposal[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Proposal[]
}

export async function getProposal(id: string, userId: string): Promise<Proposal | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as Proposal
}

export async function getProposalCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('proposals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (error) throw error
  return count ?? 0
}

export async function createProposal(
  userId: string,
  plan: Plan,
  payload: { title: string; client_name: string; content: string }
): Promise<Proposal> {
  if (plan === 'free') {
    const count = await getProposalCount(userId)
    if (count >= FREE_PLAN_LIMIT) {
      throw new Error('LIMIT_REACHED')
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('proposals')
    .insert({ ...payload, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data as Proposal
}

export async function updateProposal(
  id: string,
  userId: string,
  payload: Partial<Pick<Proposal, 'title' | 'client_name' | 'content' | 'status'>>
): Promise<Proposal> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('proposals')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data as Proposal
}

export async function deleteProposal(id: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}
