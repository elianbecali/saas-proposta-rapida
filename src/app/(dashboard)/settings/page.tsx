'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Profile } from '@/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as Profile)
        setName(data.name ?? '')
      }
    }
    load()
  }, [])

  async function handleSave() {
    if (!profile) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ name }).eq('id', profile.id)
    if (error) {
      toast.error('Erro ao salvar')
    } else {
      toast.success('Perfil atualizado!')
      setProfile({ ...profile, name })
    }
    setLoading(false)
  }

  if (!profile) return <div className="text-gray-400">Carregando...</div>

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>E-mail</Label>
            <Input value={profile.email} disabled />
          </div>
          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plano</CardTitle>
          <CardDescription>Seu plano atual e limites de uso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Plano atual:</span>
            <Badge variant={profile.plan === 'pro' ? 'default' : 'secondary'}>
              {profile.plan === 'pro' ? 'PRO' : 'Gratuito'}
            </Badge>
          </div>
          {profile.plan === 'free' && (
            <div className="rounded-lg border border-dashed p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-1">Plano PRO</p>
              <p className="text-sm text-gray-500 mb-3">Propostas ilimitadas + recursos avançados</p>
              <Button size="sm">Fazer upgrade (em breve)</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
