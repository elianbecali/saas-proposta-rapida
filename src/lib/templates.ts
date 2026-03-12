import { createClient } from '@/lib/supabase/server'
import type { Template } from '@/types'

export async function getTemplates(): Promise<Template[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Template[]
}

export async function getTemplate(id: string): Promise<Template | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Template
}
