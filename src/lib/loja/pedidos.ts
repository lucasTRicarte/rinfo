'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/db/supabase/server'
import { criarPreferencia } from '@/lib/pagamento/mercadopago'
import { enviarEmailPedidoConfirmado } from '@/lib/email'
import { incrementarUsoCupom } from '@/lib/loja/cupons'

export type ItemPedido = {
  produto_id: string
  nome: string
  preco: number
  quantidade: number
}

export type EnderecoEntrega = {
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

export async function criarPedido(params: {
  itens: ItemPedido[]
  endereco: EnderecoEntrega
  tipo_entrega: string
  frete_servico?: string
  subtotal: number
  frete: number
  desconto?: number
  total: number
  cupom_id?: string
  cupom_codigo?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Você precisa estar logado para finalizar a compra.' }

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .insert({
      perfil_id: user.id,
      status: 'aguardando_pagamento',
      tipo_entrega: params.tipo_entrega,
      frete_servico: params.frete_servico ?? null,
      endereco_entrega: params.endereco,
      subtotal: params.subtotal,
      frete: params.frete,
      desconto: params.desconto ?? 0,
      total: params.total,
      cupom_id: params.cupom_id ?? null,
      cupom_codigo: params.cupom_codigo ?? null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  const { error: itensError } = await supabase.from('pedido_itens').insert(
    params.itens.map((item) => ({
      pedido_id: pedido.id,
      produto_id: item.produto_id,
      nome_produto: item.nome,
      preco_unitario: item.preco,
      quantidade: item.quantidade,
      subtotal: item.preco * item.quantidade,
    }))
  )

  if (itensError) return { error: itensError.message }

  revalidatePath('/conta')
  return { success: true, numero: pedido.numero as number, id: pedido.id as string }
}

export async function iniciarCheckout(params: {
  itens: ItemPedido[]
  endereco: EnderecoEntrega
  tipo_entrega: string
  frete_servico?: string
  subtotal: number
  frete: number
  desconto?: number
  total: number
  cupom_id?: string
  cupom_codigo?: string
  payer?: { name?: string; email?: string }
}) {
  const resultado = await criarPedido(params)
  if (resultado.error) return resultado

  let preference
  try {
    preference = await criarPreferencia({
      pedido_id: resultado.id!,
      payer: params.payer,
      items: params.itens.map((item) => ({
        id: item.produto_id,
        title: item.nome,
        quantity: item.quantidade,
        unit_price: Math.round(item.preco * 100) / 100,
        currency_id: 'BRL' as const,
      })),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao conectar com gateway de pagamento'
    return { error: msg }
  }

  if (!preference.init_point) return { error: 'Falha ao criar sessão de pagamento' }

  // Incrementa uso do cupom (sem bloquear o fluxo)
  if (params.cupom_id) incrementarUsoCupom(params.cupom_id).catch(() => {})

  // Dispara e-mail de confirmação sem bloquear o fluxo
  if (params.payer?.email) {
    enviarEmailPedidoConfirmado({
      email: params.payer.email,
      numero: resultado.numero!,
      nome: params.payer.name ?? params.payer.email,
      itens: params.itens.map((i) => ({ nome: i.nome, quantidade: i.quantidade, preco_unitario: i.preco })),
      subtotal: params.subtotal,
      frete: params.frete,
      total: params.total,
      endereco: {
        logradouro: params.endereco.logradouro,
        numero: params.endereco.numero,
        bairro: params.endereco.bairro,
        cidade: params.endereco.cidade,
        estado: params.endereco.estado,
        cep: params.endereco.cep,
      },
    }).catch(() => {})
  }

  return { success: true, numero: resultado.numero!, id: resultado.id!, init_point: preference.init_point }
}

export async function listarMeusPedidos() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('pedidos')
    .select(`id, numero, status, total, frete, criado_em, codigo_rastreio,
      itens:pedido_itens(nome_produto, quantidade, preco_unitario)`)
    .eq('perfil_id', user.id)
    .order('criado_em', { ascending: false })

  return data ?? []
}
