'use server'

import { createClient } from '@/lib/db/supabase/server'
import { createServiceClient } from '@/lib/db/supabase/service'

export type Cupom = {
  id: string
  codigo: string
  desconto_tipo: 'percentual' | 'fixo'
  desconto_valor: number
  valido_ate: string | null
  ativo: boolean
  uso_maximo: number | null
  uso_atual: number
  valor_minimo: number | null
  categoria_ids: string[] | null  // null = sem restrição de categoria
  uso_por_perfil: boolean          // true = máximo 1 uso por conta
  criado_em: string
}

export type ResultadoCupom =
  | {
      valido: true
      cupom: Cupom
      desconto: number
      base: number               // subtotal sobre o qual o desconto incidiu
      categoriasAplicadas: string[] // nomes das categorias que se qualificaram
    }
  | { valido: false; erro: string }

export async function validarCupom(
  codigo: string,
  cartItems: { produto_id: string; preco: number; quantidade: number }[]
): Promise<ResultadoCupom> {
  const service = createServiceClient()

  // 1. Buscar cupom
  const { data, error } = await service
    .from('cupons')
    .select('*')
    .eq('codigo', codigo.trim().toUpperCase())
    .eq('ativo', true)
    .single()

  if (error || !data) return { valido: false, erro: 'Cupom não encontrado ou inativo.' }

  const cupom = data as Cupom

  // 2. Validade
  if (cupom.valido_ate && new Date(cupom.valido_ate) < new Date()) {
    return { valido: false, erro: 'Cupom expirado.' }
  }

  // 3. Limite de usos global
  if (cupom.uso_maximo !== null && cupom.uso_atual >= cupom.uso_maximo) {
    return { valido: false, erro: 'Cupom esgotado.' }
  }

  // 4. Limite de 1 uso por conta
  if (cupom.uso_por_perfil) {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return { valido: false, erro: 'Faça login para usar este cupom.' }
    }
    const { count } = await service
      .from('pedidos')
      .select('id', { count: 'exact', head: true })
      .eq('cupom_id', cupom.id)
      .eq('perfil_id', user.id)
      .neq('status', 'cancelado')
    if ((count ?? 0) > 0) {
      return { valido: false, erro: 'Você já utilizou este cupom em um pedido anterior.' }
    }
  }

  // 5. Restrição por categoria — calcular base elegível
  let base = cartItems.reduce((s, i) => s + i.preco * i.quantidade, 0)
  let categoriasAplicadas: string[] = []

  if (cupom.categoria_ids && cupom.categoria_ids.length > 0) {
    const productIds = cartItems.map((i) => i.produto_id)

    // Buscar categoria_id direto de cada produto
    const { data: prods } = await service
      .from('produtos')
      .select('id, categoria_id')
      .in('id', productIds)

    const prodCatMap: Record<string, string> = {}
    for (const p of prods ?? []) {
      prodCatMap[(p as { id: string; categoria_id: string }).id] =
        (p as { id: string; categoria_id: string }).categoria_id
    }

    // Buscar pai_id das categorias dos produtos (herança hierárquica)
    const allCatIds = [...new Set(Object.values(prodCatMap).filter(Boolean))]
    const { data: prodCats } = await service
      .from('categorias')
      .select('id, pai_id')
      .in('id', allCatIds)

    const catPaiMap: Record<string, string | null> = {}
    for (const c of prodCats ?? []) {
      catPaiMap[(c as { id: string; pai_id: string | null }).id] =
        (c as { id: string; pai_id: string | null }).pai_id
    }

    // Buscar nomes das categorias do cupom
    const { data: cats } = await service
      .from('categorias')
      .select('id, nome')
      .in('id', cupom.categoria_ids)

    const catNomeMap: Record<string, string> = {}
    for (const c of cats ?? []) {
      catNomeMap[(c as { id: string; nome: string }).id] = (c as { id: string; nome: string }).nome
    }

    // Produto é elegível se sua categoria OU sua categoria pai estiver no cupom
    const elegíveis = cartItems.filter((item) => {
      const catId = prodCatMap[item.produto_id] ?? ''
      const paiId = catPaiMap[catId] ?? null
      return (
        cupom.categoria_ids!.includes(catId) ||
        (paiId !== null && cupom.categoria_ids!.includes(paiId))
      )
    })

    if (elegíveis.length === 0) {
      const nomeCats = cupom.categoria_ids.map((id) => catNomeMap[id] ?? id).join(', ')
      return {
        valido: false,
        erro: `Este cupom é válido apenas para: ${nomeCats}. Nenhum produto elegível no carrinho.`,
      }
    }

    base = elegíveis.reduce((s, i) => s + i.preco * i.quantidade, 0)

    // Reportar pelo nome da categoria do cupom que se aplica (não da subcategoria)
    const aplicadasIds = new Set<string>()
    for (const item of elegíveis) {
      const catId = prodCatMap[item.produto_id] ?? ''
      const paiId = catPaiMap[catId] ?? null
      if (cupom.categoria_ids!.includes(catId)) aplicadasIds.add(catId)
      else if (paiId !== null && cupom.categoria_ids!.includes(paiId)) aplicadasIds.add(paiId)
    }
    categoriasAplicadas = [...aplicadasIds].map((id) => catNomeMap[id] ?? id).filter(Boolean)
  }

  // 6. Valor mínimo (sobre a base elegível)
  if (cupom.valor_minimo !== null && base < cupom.valor_minimo) {
    const contexto =
      categoriasAplicadas.length > 0
        ? ` em ${categoriasAplicadas.join(', ')}`
        : ''
    return {
      valido: false,
      erro: `Valor mínimo de R$ ${cupom.valor_minimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${contexto} para este cupom.`,
    }
  }

  // 7. Calcular desconto sobre a base
  const desconto =
    cupom.desconto_tipo === 'percentual'
      ? Math.round(base * (cupom.desconto_valor / 100) * 100) / 100
      : Math.min(cupom.desconto_valor, base)

  return { valido: true, cupom, desconto, base, categoriasAplicadas }
}

export async function incrementarUsoCupom(cupom_id: string): Promise<void> {
  const supabase = createServiceClient()
  await supabase.rpc('incrementar_uso_cupom', { p_cupom_id: cupom_id })
}

// ============ Admin ============

export async function listarCupons(): Promise<Cupom[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('cupons').select('*').order('criado_em', { ascending: false })
  return (data ?? []) as Cupom[]
}

export async function criarCupom(params: {
  codigo: string
  desconto_tipo: 'percentual' | 'fixo'
  desconto_valor: number
  valido_ate?: string | null
  uso_maximo?: number | null
  valor_minimo?: number | null
  categoria_ids?: string[] | null
  uso_por_perfil?: boolean
}): Promise<{ error?: string }> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('cupons').insert({
    codigo: params.codigo.trim().toUpperCase(),
    desconto_tipo: params.desconto_tipo,
    desconto_valor: params.desconto_valor,
    valido_ate: params.valido_ate ?? null,
    uso_maximo: params.uso_maximo ?? null,
    valor_minimo: params.valor_minimo ?? null,
    categoria_ids: params.categoria_ids?.length ? params.categoria_ids : null,
    uso_por_perfil: params.uso_por_perfil ?? false,
    ativo: true,
    uso_atual: 0,
  })
  if (error) {
    console.error('[criarCupom]', error.code, error.message, error.details)
    if (error.code === '23505') return { error: 'Código de cupom já existe.' }
    return { error: `Erro ao criar cupom: ${error.message}` }
  }
  return {}
}

export async function atualizarCupom(
  id: string,
  params: Partial<Omit<Cupom, 'id' | 'criado_em' | 'uso_atual'>>
): Promise<{ error?: string }> {
  const supabase = createServiceClient()
  if (params.codigo) params = { ...params, codigo: params.codigo.trim().toUpperCase() }
  if ('categoria_ids' in params && Array.isArray(params.categoria_ids)) {
    params = { ...params, categoria_ids: params.categoria_ids.length ? params.categoria_ids : null }
  }
  const { error } = await supabase.from('cupons').update(params).eq('id', id)
  return error ? { error: 'Erro ao atualizar cupom.' } : {}
}

export async function excluirCupom(id: string): Promise<{ error?: string }> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('cupons').delete().eq('id', id)
  return error ? { error: 'Erro ao excluir cupom.' } : {}
}
