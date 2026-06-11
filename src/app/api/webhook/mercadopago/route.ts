import { NextRequest, NextResponse } from 'next/server'
import MercadoPagoConfig, { Payment } from 'mercadopago'
import { createServiceClient } from '@/lib/db/supabase/service'

const statusMap: Record<string, string> = {
  approved:   'pagamento_aprovado',
  pending:    'aguardando_pagamento',
  in_process: 'aguardando_pagamento',
  authorized: 'aguardando_pagamento',
  rejected:   'cancelado',
  cancelled:  'cancelado',
  refunded:   'reembolsado',
  charged_back: 'reembolsado',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.type !== 'payment') return NextResponse.json({ ok: true })

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!token) return NextResponse.json({ ok: true })

    const client = new MercadoPagoConfig({ accessToken: token })
    const paymentApi = new Payment(client)
    const payment = await paymentApi.get({ id: String(paymentId) })

    const pedido_id = payment.external_reference
    const novoStatus = statusMap[payment.status ?? '']

    if (!pedido_id || !novoStatus) return NextResponse.json({ ok: true })

    const supabase = createServiceClient()
    await supabase
      .from('pedidos')
      .update({
        status: novoStatus,
        pagamento_id: String(paymentId),
        pagamento_metodo: payment.payment_type_id ?? null,
      })
      .eq('id', pedido_id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhook/mercadopago]', err)
    return NextResponse.json({ ok: true })
  }
}
