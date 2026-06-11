'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/db/supabase/server'
import { criarPreferencia } from '@/lib/pagamento/mercadopago'

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
  subtotal: number
  frete: number
  total: number
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
      endereco_entrega: params.endereco,
      subtotal: params.subtotal,
      frete: params.frete,
      total: params.total,
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
  subtotal: number
  frete: number
  total: number
  payer?: { name?: string; email?: string }
}) {
  const resultado = await criarPedido(params)
  if (resultado.error) return resultado

  const preference = await criarPreferencia({
    pedido_id: resultado.id!,
    payer: params.payer,
    items: params.itens.map((item) => ({
      id: item.produto_id,
      title: item.nome,
      quantity: item.quantidade,
      unit_price: item.preco,
      currency_id: 'BRL' as const,
    })),
  })

  if (!preference.init_point) return { error: 'Falha ao criar sessão de pagamento' }

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
