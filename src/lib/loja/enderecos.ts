'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/db/supabase/server'

export type Endereco = {
  id: string
  apelido: string | null
  cep: string
  logradouro: string
  numero: string
  complemento: string | null
  bairro: string
  cidade: string
  estado: string
  principal: boolean
}

export async function listarEnderecos(): Promise<Endereco[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('enderecos')
    .select('id, apelido, cep, logradouro, numero, complemento, bairro, cidade, estado, principal')
    .order('principal', { ascending: false })
    .order('criado_em', { ascending: false })
  return (data ?? []) as Endereco[]
}

export async function criarEndereco(params: Omit<Endereco, 'id' | 'principal'>): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('enderecos').insert({
    perfil_id: user.id,
    ...params,
    principal: false,
  })
  if (error) return { error: error.message }

  revalidatePath('/conta')
  return {}
}

export async function atualizarEndereco(id: string, params: Omit<Endereco, 'id' | 'principal'>): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('enderecos').update(params).eq('id', id).eq('perfil_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/conta')
  return {}
}

export async function excluirEndereco(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('enderecos').delete().eq('id', id).eq('perfil_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/conta')
  return {}
}

export async function definirEnderecoPrincipal(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  await supabase.from('enderecos').update({ principal: false }).eq('perfil_id', user.id)
  const { error } = await supabase.from('enderecos').update({ principal: true }).eq('id', id).eq('perfil_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/conta')
  return {}
}
