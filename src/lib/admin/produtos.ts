'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/db/supabase/server'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  if (data?.role !== 'admin') throw new Error('Sem permissão de administrador')
  return supabase
}

export async function listarProdutosAdmin(params?: {
  busca?: string
  categoria_id?: string
  ativo?: boolean
  pagina?: number
  por_pagina?: number
}) {
  const supabase = await createClient()
  const { busca, categoria_id, ativo, pagina = 1, por_pagina = 20 } = params ?? {}

  let query = supabase
    .from('produtos')
    .select(`
      id, nome, slug, preco, preco_original, badge, sku,
      estoque_fisico, ativo, destaque, dropshipping,
      avaliacao_media, total_avaliacoes, criado_em,
      categoria:categorias(id, nome, slug)
    `, { count: 'exact' })
    .order('criado_em', { ascending: false })
    .range((pagina - 1) * por_pagina, pagina * por_pagina - 1)

  if (busca) query = query.ilike('nome', `%${busca}%`)
  if (categoria_id) query = query.eq('categoria_id', categoria_id)
  if (ativo !== undefined) query = query.eq('ativo', ativo)

  const { data, error, count } = await query
  if (error) throw error
  return { produtos: data ?? [], total: count ?? 0 }
}

export async function buscarProdutoAdmin(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('produtos')
    .select(`
      *,
      categoria:categorias(id, nome, slug),
      specs:produto_specs(id, chave, valor, ordem),
      imagens:produto_imagens(id, url, alt, principal, ordem)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function criarProduto(formData: FormData) {
  const supabase = await assertAdmin()

  const specsJson = formData.get('specs') as string
  const specs = specsJson ? JSON.parse(specsJson) : []

  const produtoData = {
    nome: formData.get('nome') as string,
    slug: formData.get('slug') as string,
    descricao: (formData.get('descricao') as string) || null,
    descricao_curta: (formData.get('descricao_curta') as string) || null,
    preco: Number(formData.get('preco')),
    preco_original: formData.get('preco_original') ? Number(formData.get('preco_original')) : null,
    badge: (formData.get('badge') as string) || null,
    sku: (formData.get('sku') as string) || null,
    categoria_id: (formData.get('categoria_id') as string) || null,
    fornecedor_id: (formData.get('fornecedor_id') as string) || null,
    estoque_fisico: Number(formData.get('estoque_fisico') || 0),
    dropshipping: formData.get('dropshipping') === 'true',
    ativo: formData.get('ativo') === 'true',
    destaque: formData.get('destaque') === 'true',
    peso_kg: formData.get('peso_kg') ? Number(formData.get('peso_kg')) : null,
    altura_cm: formData.get('altura_cm') ? Number(formData.get('altura_cm')) : null,
    largura_cm: formData.get('largura_cm') ? Number(formData.get('largura_cm')) : null,
    comprimento_cm: formData.get('comprimento_cm') ? Number(formData.get('comprimento_cm')) : null,
  }

  if (!produtoData.nome || !produtoData.slug || !produtoData.preco) {
    return { error: 'Nome, slug e preço são obrigatórios' }
  }

  const { data: produto, error } = await supabase.from('produtos').insert(produtoData).select().single()
  if (error) return { error: error.message }

  if (specs.length > 0) {
    await supabase.from('produto_specs').insert(
      specs.map((s: { chave: string; valor: string }, i: number) => ({
        produto_id: produto.id, chave: s.chave, valor: s.valor, ordem: i,
      }))
    )
  }

  const imagensJson = formData.get('imagens_json') as string
  const imagens: { url: string; principal: boolean; ordem: number }[] = imagensJson ? JSON.parse(imagensJson) : []
  if (imagens.length > 0) {
    await supabase.from('produto_imagens').insert(
      imagens.map((img) => ({ produto_id: produto.id, url: img.url, principal: img.principal, ordem: img.ordem }))
    )
  }

  revalidatePath('/admin/produtos')
  revalidatePath('/produtos')
  return { success: true, id: produto.id }
}

export async function atualizarProduto(id: string, formData: FormData) {
  const supabase = await assertAdmin()

  const specsJson = formData.get('specs') as string
  const specs = specsJson ? JSON.parse(specsJson) : []

  const produtoData = {
    nome: formData.get('nome') as string,
    slug: formData.get('slug') as string,
    descricao: (formData.get('descricao') as string) || null,
    descricao_curta: (formData.get('descricao_curta') as string) || null,
    preco: Number(formData.get('preco')),
    preco_original: formData.get('preco_original') ? Number(formData.get('preco_original')) : null,
    badge: (formData.get('badge') as string) || null,
    sku: (formData.get('sku') as string) || null,
    categoria_id: (formData.get('categoria_id') as string) || null,
    fornecedor_id: (formData.get('fornecedor_id') as string) || null,
    estoque_fisico: Number(formData.get('estoque_fisico') || 0),
    dropshipping: formData.get('dropshipping') === 'true',
    ativo: formData.get('ativo') === 'true',
    destaque: formData.get('destaque') === 'true',
    peso_kg: formData.get('peso_kg') ? Number(formData.get('peso_kg')) : null,
    altura_cm: formData.get('altura_cm') ? Number(formData.get('altura_cm')) : null,
    largura_cm: formData.get('largura_cm') ? Number(formData.get('largura_cm')) : null,
    comprimento_cm: formData.get('comprimento_cm') ? Number(formData.get('comprimento_cm')) : null,
  }

  const { error } = await supabase.from('produtos').update(produtoData).eq('id', id)
  if (error) return { error: error.message }

  // Recriar specs
  await supabase.from('produto_specs').delete().eq('produto_id', id)
  if (specs.length > 0) {
    await supabase.from('produto_specs').insert(
      specs.map((s: { chave: string; valor: string }, i: number) => ({
        produto_id: id, chave: s.chave, valor: s.valor, ordem: i,
      }))
    )
  }

  const imagensJson = formData.get('imagens_json') as string
  const imagens: { url: string; principal: boolean; ordem: number }[] = imagensJson ? JSON.parse(imagensJson) : []
  await supabase.from('produto_imagens').delete().eq('produto_id', id)
  if (imagens.length > 0) {
    await supabase.from('produto_imagens').insert(
      imagens.map((img) => ({ produto_id: id, url: img.url, principal: img.principal, ordem: img.ordem }))
    )
  }

  revalidatePath('/admin/produtos')
  revalidatePath(`/admin/produtos/${id}/editar`)
  revalidatePath('/produtos')
  return { success: true }
}

export async function excluirProduto(id: string) {
  const supabase = await assertAdmin()
  const { error } = await supabase.from('produtos').update({ ativo: false }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/produtos')
  return { success: true }
}

export async function atualizarEstoque(id: string, estoque: number) {
  const supabase = await assertAdmin()
  const { error } = await supabase.from('produtos').update({ estoque_fisico: estoque }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/estoque')
  revalidatePath('/admin/produtos')
  return { success: true }
}

export async function toggleProdutoAtivo(id: string, ativo: boolean) {
  const supabase = await assertAdmin()
  const { error } = await supabase.from('produtos').update({ ativo }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/produtos')
  return { success: true }
}

export async function listarEstoque(busca?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('produtos')
    .select('id, nome, slug, sku, estoque_fisico, dropshipping, ativo, categoria:categorias(nome)')
    .eq('ativo', true)
    .order('estoque_fisico')

  if (busca) query = query.ilike('nome', `%${busca}%`)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
