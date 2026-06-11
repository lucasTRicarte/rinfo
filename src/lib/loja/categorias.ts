'use server'

import { createClient } from '@/lib/db/supabase/server'

export type CategoriaPublica = {
  id: string
  nome: string
  slug: string
  descricao: string | null
  imagem_url: string | null
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
