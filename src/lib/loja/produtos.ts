'use server'

import { createClient } from '@/lib/db/supabase/server'

export type ProdutoCard = {
  id: string
  nome: string
  slug: string
  preco: number
  preco_original: number | null
  badge: 'MAIS VENDIDO' | 'PROMOÇÃO' | 'NOVO' | null
  avaliacao_media: number
  total_avaliacoes: number
  estoque_fisico: number
  dropshipping: boolean
  categoria_nome: string | null
  categoria_slug: string | null
  imagem_url: string | null
}

export type ProdutoDetalhe = ProdutoCard & {
  descricao: string | null
  descricao_curta: string | null
  peso_kg: number | null
  specs: { chave: string; valor: string }[]
  imagens: { url: string; alt: string | null; principal: boolean }[]
}

export type ListarProdutosResult = {
  produtos: ProdutoCard[]
  total: number
}

const BASE_SELECT = `
  id, nome, slug, preco, preco_original, badge,
  avaliacao_media, total_avaliacoes, estoque_fisico, dropshipping,
  categoria:categorias(nome, slug),
  imagens:produto_imagens(url, principal)
`

function mapCard(p: Record<string, unknown>): ProdutoCard {
  const imgs = (p.imagens ?? []) as { url: string; principal: boolean }[]
  const cat = p.categoria as { nome: string; slug: string } | null
  return {
    id: p.id as string,
    nome: p.nome as string,
    slug: p.slug as string,
    preco: p.preco as number,
    preco_original: (p.preco_original as number) ?? null,
    badge: (p.badge as ProdutoCard['badge']) ?? null,
    avaliacao_media: (p.avaliacao_media as number) ?? 0,
    total_avaliacoes: (p.total_avaliacoes as number) ?? 0,
    estoque_fisico: (p.estoque_fisico as number) ?? 0,
    dropshipping: (p.dropshipping as boolean) ?? false,
    categoria_nome: cat?.nome ?? null,
    categoria_slug: cat?.slug ?? null,
    imagem_url: imgs.find((i) => i.principal)?.url ?? imgs[0]?.url ?? null,
  }
}

export async function listarProdutos(params?: {
  categoria_slug?: string
  busca?: string
  preco_max?: number
  sort?: 'relevancia' | 'menor-preco' | 'maior-preco' | 'avaliacao'
  pagina?: number
  por_pagina?: number
}): Promise<ListarProdutosResult> {
  const supabase = await createClient()
  const porPagina = params?.por_pagina ?? 20
  const pagina   = Math.max(1, params?.pagina ?? 1)
  const from     = (pagina - 1) * porPagina
  const to       = from + porPagina - 1

  let query = supabase
    .from('produtos')
    .select(BASE_SELECT, { count: 'exact' })
    .eq('ativo', true)

  if (params?.categoria_slug) {
    const { data: cat } = await supabase
      .from('categorias').select('id, pai_id').eq('slug', params.categoria_slug).single()
    if (cat) {
      const catData = cat as { id: string; pai_id: string | null }
      if (catData.pai_id === null) {
        // Categoria pai: inclui produtos das subcategorias também
        const { data: subcats } = await supabase
          .from('categorias').select('id').eq('pai_id', catData.id).eq('ativo', true)
        const ids = [catData.id, ...(subcats ?? []).map((s) => (s as { id: string }).id)]
        query = query.in('categoria_id', ids)
      } else {
        // Subcategoria: filtro exato — só o que está diretamente nela
        query = query.eq('categoria_id', catData.id)
      }
    }
  }

  if (params?.busca) {
    const termo = params.busca.replace(/[%_]/g, '\\$&')
    query = query.or(`nome.ilike.%${termo}%,descricao.ilike.%${termo}%`)
  }

  if (params?.preco_max) query = query.lte('preco', params.preco_max)

  switch (params?.sort) {
    case 'menor-preco': query = query.order('preco', { ascending: true });  break
    case 'maior-preco': query = query.order('preco', { ascending: false }); break
    case 'avaliacao':   query = query.order('avaliacao_media', { ascending: false }); break
    default:            query = query.order('criado_em', { ascending: false })
  }

  const { data, error, count } = await query.range(from, to)
  if (error) throw error

  return {
    produtos: (data ?? []).map((p) => mapCard(p as Record<string, unknown>)),
    total: count ?? 0,
  }
}

export async function listarProdutosDestaque(): Promise<ProdutoCard[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('produtos').select(BASE_SELECT)
    .eq('ativo', true).eq('destaque', true)
    .order('criado_em', { ascending: false }).limit(12)
  if (error) return []
  return (data ?? []).map((p) => mapCard(p as Record<string, unknown>))
}

export async function listarProdutosPorBadge(badge: string): Promise<ProdutoCard[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('produtos').select(BASE_SELECT)
    .eq('ativo', true).eq('badge', badge).limit(12)
  if (error) return []
  return (data ?? []).map((p) => mapCard(p as Record<string, unknown>))
}

export async function buscarProdutoPorSlug(slug: string): Promise<ProdutoDetalhe | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('produtos')
    .select(`
      id, nome, slug, preco, preco_original, badge, descricao, descricao_curta, peso_kg,
      avaliacao_media, total_avaliacoes, estoque_fisico, dropshipping,
      categoria:categorias(nome, slug),
      specs:produto_specs(chave, valor, ordem),
      imagens:produto_imagens(url, alt, principal, ordem)
    `)
    .eq('slug', slug).eq('ativo', true).single()

  if (error || !data) return null

  const d = data as Record<string, unknown>
  const imgs = ((d.imagens ?? []) as Record<string, unknown>[]).sort(
    (a, b) => (a.ordem as number) - (b.ordem as number)
  )

  return {
    ...mapCard(d),
    descricao: (d.descricao as string) ?? null,
    descricao_curta: (d.descricao_curta as string) ?? null,
    peso_kg: (d.peso_kg as number) ?? null,
    specs: ((d.specs ?? []) as Record<string, unknown>[])
      .sort((a, b) => (a.ordem as number) - (b.ordem as number))
      .map((s) => ({ chave: s.chave as string, valor: s.valor as string })),
    imagens: imgs.map((i) => ({
      url: i.url as string,
      alt: (i.alt as string) ?? null,
      principal: i.principal as boolean,
    })),
  }
}
