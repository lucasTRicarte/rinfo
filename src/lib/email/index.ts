'use server'

import { Resend } from 'resend'
import {
  templatePedidoConfirmado,
  templatePagamentoAprovado,
  templatePedidoEnviado,
  type ItemEmail,
} from './templates'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY não configurado')
  return new Resend(key)
}

const FROM = process.env.RESEND_FROM ?? 'Ricarte Informática <onboarding@resend.dev>'

type Endereco = {
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export async function enviarEmailPedidoConfirmado(params: {
  email: string
  numero: number
  nome: string
  itens: ItemEmail[]
  subtotal: number
  frete: number
  total: number
  endereco: Endereco
}) {
  try {
    const { subject, html } = templatePedidoConfirmado(params)
    const resend = getResend()
    await resend.emails.send({ from: FROM, to: params.email, subject, html })
  } catch (err) {
    console.error('[email] pedido-confirmado:', err)
  }
}

export async function enviarEmailPagamentoAprovado(params: {
  email: string
  numero: number
  nome: string
  total: number
  itens: ItemEmail[]
  pagamento_metodo?: string | null
}) {
  try {
    const { subject, html } = templatePagamentoAprovado(params)
    const resend = getResend()
    await resend.emails.send({ from: FROM, to: params.email, subject, html })
  } catch (err) {
    console.error('[email] pagamento-aprovado:', err)
  }
}

export async function enviarEmailPedidoEnviado(params: {
  email: string
  numero: number
  nome: string
  codigo_rastreio: string
  itens: ItemEmail[]
  endereco: Endereco
}) {
  try {
    const { subject, html } = templatePedidoEnviado(params)
    const resend = getResend()
    await resend.emails.send({ from: FROM, to: params.email, subject, html })
  } catch (err) {
    console.error('[email] pedido-enviado:', err)
  }
}
