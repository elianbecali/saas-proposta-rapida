export type Plan = 'free' | 'pro'
export type ProposalStatus = 'draft' | 'sent' | 'approved'

export interface Profile {
  id: string
  email: string
  name: string | null
  plan: Plan
  created_at: string
}

export interface Proposal {
  id: string
  user_id: string
  title: string
  client_name: string
  content: string
  status: ProposalStatus
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  name: string
  content: string
  created_at: string
}
