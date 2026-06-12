'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/db/supabase/server'
import type { StatusPedido } from '@/types/database'
import { enviarEmailPedidoEnviado } from '@/lib/email'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  if (data?.role !== 'admin') throw new Error('Sem permissão de administrador')
  return supabase
}

export async function listarPedidosAdmin(params?: {
  status?: StatusPedido
  busca?: string
  pagina?: number
  por_pagina?: number
}) {
  const supabase = await createClient()
  const { status, busca, pagina = 1, por_pagina = 20 } = params ?? {}

  let query = supabase
    .from('pedidos')
    .select(`
      id, numero, status, total, subtotal, frete, frete_servico,
      pagamento_metodo, criado_em, codigo_rastreio,
      perfil:perfis(nome, telefone),
      itens:pedido_itens(id, nome_produto, quantidade, preco_unitario, subtotal)
    `, { count: 'exact' })
    .order('criado_em', { ascending: false })
    .range((pagina - 1) * por_pagina, pagina * por_pagina - 1)

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query
  if (error) throw error
  return { pedidos: data ?? [], total: count ?? 0 }
}

export async function buscarPedidoAdmin(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      perfil:perfis(id, nome, telefone, cpf),
      itens:pedido_itens(
        id, nome_produto, quantidade, preco_unitario, subtotal,
        produto:produtos(id, slug)
      )
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function atualizarStatusPedido(id: string, status: StatusPedido) {
  const supabase = await assertAdmin()
  const { error } = await supabase.from('pedidos').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${id}`)
  return { success: true }
}

export async function atualizarRastreio(id: string, codigo_rastreio: string) {
  const supabase = await assertAdmin()
  const { error } = await supabase
    .from('pedidos')
    .update({ codigo_rastreio, status: 'enviado' })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/pedidos/${id}`)
  revalidatePath('/admin/pedidos')

  // Busca dados do pedido para enviar e-mail
  const { data: pedido } = await supabase
    .from('pedidos')
    .select(`numero, endereco_entrega, perfil_id,
      itens:pedido_itens(nome_produto, quantidade, preco_unitario)`)
    .eq('id', id)
    .single()

  if (pedido) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('nome')
      .eq('id', pedido.perfil_id)
      .single()

    const { data: authUser } = await supabase.auth.admin.getUserById(pedido.perfil_id)

    const emailCliente = authUser?.user?.email
    if (emailCliente) {
      const end = pedido.endereco_entrega as Record<string, string>
      const itens = ((pedido.itens ?? []) as { nome_produto: string; quantidade: number; preco_unitario: number }[])
        .map((i) => ({ nome: i.nome_produto, quantidade: i.quantidade, preco_unitario: i.preco_unitario }))

      enviarEmailPedidoEnviado({
        email: emailCliente,
        numero: pedido.numero as number,
        nome: perfil?.nome ?? emailCliente,
        codigo_rastreio,
        itens,
        endereco: {
          logradouro: end.logradouro ?? '',
          numero: end.numero ?? '',
          bairro: end.bairro ?? '',
          cidade: end.cidade ?? '',
          estado: end.estado ?? '',
          cep: end.cep ?? '',
        },
      }).catch(() => {})
    }
  }

  return { success: true }
}

export async function statsAdmin() {
  const supabase = await createClient()

  const [pedidos, produtos, clientes, receita] = await Promise.all([
    supabase.from('pedidos').select('id', { count: 'exact', head: true }),
    supabase.from('produtos').select('id', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('perfis').select('id', { count: 'exact', head: true }).eq('role', 'cliente'),
    supabase.from('pedidos').select('total').not('status', 'in', '(cancelado,reembolsado)'),
  ])

  const receitaTotal = receita.data?.reduce((s, p) => s + Number(p.total), 0) ?? 0

  return {
    totalPedidos: pedidos.count ?? 0,
    totalProdutos: produtos.count ?? 0,
    totalClientes: clientes.count ?? 0,
    receitaTotal,
  }
}
