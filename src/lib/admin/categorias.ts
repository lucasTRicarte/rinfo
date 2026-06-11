'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/db/supabase/server'
import type { Categoria } from '@/types/database'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  if (data?.role !== 'admin') throw new Error('Sem permissão de administrador')
  return supabase
}

export async function listarCategorias(): Promise<Categoria[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('ordem')
    .order('nome')
  if (error) throw error
  return data ?? []
}

export async function listarCategoriasComFilhos() {
  const todas = await listarCategorias()
  const raizes = todas.filter((c) => !c.pai_id)
  return raizes.map((pai) => ({
    ...pai,
    filhos: todas.filter((c) => c.pai_id === pai.id),
  }))
}

export type CategoriaFormData = {
  nome: string
  slug: string
  descricao: string
  imagem_url: string
  pai_id: string
  ativo: boolean
  ordem: number
}

export async function criarCategoria(formData: FormData) {
  const supabase = await assertAdmin()

  const data: Partial<CategoriaFormData> = {
    nome: formData.get('nome') as string,
    slug: formData.get('slug') as string,
    descricao: (formData.get('descricao') as string) || null as unknown as string,
    imagem_url: (formData.get('imagem_url') as string) || null as unknown as string,
    pai_id: (formData.get('pai_id') as string) || null as unknown as string,
    ativo: formData.get('ativo') === 'true',
    ordem: Number(formData.get('ordem') || 0),
  }

  if (!data.nome || !data.slug) return { error: 'Nome e slug são obrigatórios' }

  const { error } = await supabase.from('categorias').insert(data)
  if (error) return { error: error.message }

  revalidatePath('/admin/categorias')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function atualizarCategoria(id: string, formData: FormData) {
  const supabase = await assertAdmin()

  const data: Partial<CategoriaFormData> = {
    nome: formData.get('nome') as string,
    slug: formData.get('slug') as string,
    descricao: (formData.get('descricao') as string) || null as unknown as string,
    imagem_url: (formData.get('imagem_url') as string) || null as unknown as string,
    pai_id: (formData.get('pai_id') as string) || null as unknown as string,
    ativo: formData.get('ativo') === 'true',
    ordem: Number(formData.get('ordem') || 0),
  }

  if (!data.nome || !data.slug) return { error: 'Nome e slug são obrigatórios' }

  const { error } = await supabase.from('categorias').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/categorias')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function excluirCategoria(id: string) {
  const supabase = await assertAdmin()
  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categorias')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function toggleCategoriaAtivo(id: string, ativo: boolean) {
  const supabase = await assertAdmin()
  const { error } = await supabase.from('categorias').update({ ativo }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categorias')
  return { success: true }
}
