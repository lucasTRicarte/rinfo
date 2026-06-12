import { NextRequest, NextResponse } from 'next/server'
import MercadoPagoConfig, { Payment } from 'mercadopago'
import { createServiceClient } from '@/lib/db/supabase/service'
import { enviarEmailPagamentoAprovado } from '@/lib/email'

const statusMap: Record<string, string> = {
  approved:     'pagamento_aprovado',
  pending:      'aguardando_pagamento',
  in_process:   'aguardando_pagamento',
  authorized:   'aguardando_pagamento',
  rejected:     'cancelado',
  cancelled:    'cancelado',
  refunded:     'reembolsado',
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

    // Dispara e-mail de pagamento aprovado
    if (novoStatus === 'pagamento_aprovado') {
      const { data: pedido } = await supabase
        .from('pedidos')
        .select(`numero, total, pagamento_metodo, perfil_id,
          itens:pedido_itens(nome_produto, quantidade, preco_unitario)`)
        .eq('id', pedido_id)
        .single()

      if (pedido) {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('nome')
          .eq('id', pedido.perfil_id)
          .single()

        // E-mail do pagador vem do payload do MP
        const emailPagador = payment.payer?.email
        if (emailPagador) {
          const itens = ((pedido.itens ?? []) as { nome_produto: string; quantidade: number; preco_unitario: number }[])
            .map((i) => ({ nome: i.nome_produto, quantidade: i.quantidade, preco_unitario: i.preco_unitario }))

          enviarEmailPagamentoAprovado({
            email: emailPagador,
            numero: pedido.numero as number,
            nome: perfil?.nome ?? emailPagador,
            total: pedido.total as number,
            itens,
            pagamento_metodo: pedido.pagamento_metodo as string | null,
          }).catch(() => {})
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhook/mercadopago]', err)
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 })
}
