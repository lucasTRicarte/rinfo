'use server'

import { createClient } from '@/lib/db/supabase/server'

export type CategoriaPublica = {
  id: string
  nome: string
  slug: string
  descricao: string | null
  imagem_url: string | null
}

export type CategoriaComSubs = CategoriaPublica & {
  subcategorias: CategoriaPublica[]
}

export async function listarCategoriasPublicas(): Promise<CategoriaPublica[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nome, slug, descricao, imagem_url')
    .eq('ativo', true)
    .is('pai_id', null)
    .order('ordem')
  if (error) return []
  return (data ?? []) as CategoriaPublica[]
}

export async function listarCategoriasComSubs(): Promise<CategoriaComSubs[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nome, slug, descricao, imagem_url, pai_id')
    .eq('ativo', true)
    .order('ordem')
  if (error) return []

  const all = (data ?? []) as (CategoriaPublica & { pai_id: string | null })[]
  const parents = all.filter((c) => c.pai_id === null)
  const children = all.filter((c) => c.pai_id !== null)

  return parents.map((parent) => ({
    ...parent,
    subcategorias: children.filter((c) => c.pai_id === parent.id),
  }))
}
