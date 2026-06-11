'use server'

import MercadoPagoConfig, { Preference } from 'mercadopago'

function getClient() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado')
  return new MercadoPagoConfig({ accessToken: token })
}

export type PreferenceItem = {
  id: string
  title: string
  quantity: number
  unit_price: number
  currency_id: 'BRL'
}

export async function criarPreferencia(params: {
  pedido_id: string
  items: PreferenceItem[]
  payer?: { name?: string; email?: string }
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const client = getClient()
  const preference = new Preference(client)

  const result = await preference.create({
    body: {
      external_reference: params.pedido_id,
      items: params.items,
      payer: params.payer,
      back_urls: {
        success: `${siteUrl}/checkout/sucesso`,
        failure: `${siteUrl}/checkout/falha`,
        pending: `${siteUrl}/checkout/pendente`,
      },
      auto_return: 'approved',
      payment_methods: {
        installments: 12,
      },
      statement_descriptor: 'Ricarte Informatica',
      notification_url: `${siteUrl}/api/webhook/mercadopago`,
    },
  })

  return result
}
