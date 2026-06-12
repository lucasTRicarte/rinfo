'use server'

import { createClient } from '@/lib/db/supabase/server'
import { createServiceClient } from '@/lib/db/supabase/service'

export type Avaliacao = {
  id: string
  produto_id: string
  perfil_id: string
  perfil_nome: string
  nota: number
  titulo: string | null
  comentario: string
  aprovado: boolean
  criado_em: string
}

export async function listarAvaliacoes(produto_id: string): Promise<Avaliacao[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('avaliacoes')
    .select('id, produto_id, perfil_id, nota, titulo, comentario, aprovado, criado_em, perfil:perfis(nome)')
    .eq('produto_id', produto_id)
    .eq('aprovado', true)
    .order('criado_em', { ascending: false })

  return (data ?? []).map((r) => {
    const d = r as Record<string, unknown>
    const perfil = d.perfil as { nome: string } | null
    return {
      id: d.id as string,
      produto_id: d.produto_id as string,
      perfil_id: d.perfil_id as string,
      perfil_nome: perfil?.nome ?? 'Cliente',
      nota: d.nota as number,
      titulo: (d.titulo as string) ?? null,
      comentario: d.comentario as string,
      aprovado: d.aprovado as boolean,
      criado_em: d.criado_em as string,
    }
  })
}

export async function minhaAvaliacao(produto_id: string): Promise<Avaliacao | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('avaliacoes')
    .select('id, produto_id, perfil_id, nota, titulo, comentario, aprovado, criado_em, perfil:perfis(nome)')
    .eq('produto_id', produto_id)
    .eq('perfil_id', user.id)
    .single()

  if (!data) return null
  const d = data as Record<string, unknown>
  const perfil = d.perfil as { nome: string } | null
  return {
    id: d.id as string,
    produto_id: d.produto_id as string,
    perfil_id: d.perfil_id as string,
    perfil_nome: perfil?.nome ?? 'Você',
    nota: d.nota as number,
    titulo: (d.titulo as string) ?? null,
    comentario: d.comentario as string,
    aprovado: d.aprovado as boolean,
    criado_em: d.criado_em as string,
  }
}

export async function criarAvaliacao(params: {
  produto_id: string
  nota: number
  comentario: string
  titulo?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Faça login para avaliar o produto.' }

  const { error } = await supabase.from('avaliacoes').insert({
    produto_id: params.produto_id,
    perfil_id: user.id,
    nota: params.nota,
    comentario: params.comentario,
    titulo: params.titulo ?? null,
    aprovado: true,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Você já avaliou este produto.' }
    return { error: 'Erro ao enviar avaliação.' }
  }
  return {}
}

export async function excluirMinhaAvaliacao(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { error } = await supabase
    .from('avaliacoes').delete()
    .eq('id', id).eq('perfil_id', user.id)

  return error ? { error: 'Erro ao excluir avaliação.' } : {}
}

// ============ Admin ============

export async function listarTodasAvaliacoes(params?: {
  aprovado?: boolean
  pagina?: number
  por_pagina?: number
}): Promise<{ avaliacoes: Avaliacao[]; total: number }> {
  const supabase = createServiceClient()
  const porPagina = params?.por_pagina ?? 30
  const pagina    = Math.max(1, params?.pagina ?? 1)
  const from      = (pagina - 1) * porPagina
  const to        = from + porPagina - 1

  let query = supabase
    .from('avaliacoes')
    .select('id, produto_id, perfil_id, nota, titulo, comentario, aprovado, criado_em, perfil:perfis(nome), produto:produtos(nome)', { count: 'exact' })
    .order('criado_em', { ascending: false })
    .range(from, to)

  if (params?.aprovado !== undefined) query = query.eq('aprovado', params.aprovado)

  const { data, count } = await query
  return {
    avaliacoes: (data ?? []).map((r) => {
      const d = r as Record<string, unknown>
      const perfil  = d.perfil  as { nome: string } | null
      const produto = d.produto as { nome: string } | null
      return {
        id: d.id as string,
        produto_id: d.produto_id as string,
        perfil_id: d.perfil_id as string,
        perfil_nome: perfil?.nome ?? 'Cliente',
        nota: d.nota as number,
        titulo: (d.titulo as string) ?? null,
        comentario: d.comentario as string,
        aprovado: d.aprovado as boolean,
        criado_em: d.criado_em as string,
        produto_nome: produto?.nome ?? '',
      } as Avaliacao & { produto_nome: string }
    }),
    total: count ?? 0,
  }
}

export async function aprovarAvaliacao(id: string): Promise<{ error?: string }> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('avaliacoes').update({ aprovado: true }).eq('id', id)
  return error ? { error: 'Erro ao aprovar.' } : {}
}

export async function reprovarAvaliacao(id: string): Promise<{ error?: string }> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('avaliacoes').update({ aprovado: false }).eq('id', id)
  return error ? { error: 'Erro ao reprovar.' } : {}
}

export async function excluirAvaliacao(id: string): Promise<{ error?: string }> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('avaliacoes').delete().eq('id', id)
  return error ? { error: 'Erro ao excluir.' } : {}
}
