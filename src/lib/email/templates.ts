const LOGO_URL    = process.env.NEXT_PUBLIC_EMAIL_LOGO_URL ?? ''
const CNPJ        = '08.695.271/0001-10'
const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const COR_AZUL    = '#002C63'
const COR_DOURADO = '#D4A63A'

function base(titulo: string, conteudo: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${titulo} — Ricarte Informática</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f2f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,44,99,0.10);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,${COR_AZUL} 0%,#003E8A 100%);padding:32px 40px;text-align:center;">
            ${LOGO_URL
              ? `<img src="${LOGO_URL}" alt="Ricarte Informática" style="height:64px;width:auto;display:block;margin:0 auto 16px;" />`
              : `<div style="display:inline-block;width:60px;height:60px;background:rgba(255,255,255,0.15);border:2px solid rgba(212,166,58,0.5);border-radius:12px;line-height:60px;font-size:28px;font-weight:900;color:${COR_DOURADO};margin-bottom:16px;">Ri</div>`
            }
            <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:3px;margin-bottom:2px;">RICARTE</div>
            <div style="font-size:10px;font-weight:600;color:${COR_DOURADO};letter-spacing:4px;">INFORMÁTICA</div>
          </td>
        </tr>

        <!-- CONTENT -->
        <tr><td style="padding:40px;">
          ${conteudo}
        </td></tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8f9fc;border-top:1px solid #e8ecf3;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">
              <strong style="color:#374151;">Ricarte Informática</strong> &nbsp;·&nbsp; CNPJ ${CNPJ}
            </p>
            <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
              Este e-mail foi enviado automaticamente. Por favor, não responda.
            </p>
            <p style="margin:0;font-size:11px;color:#d1d5db;">
              © ${new Date().getFullYear()} Ricarte Informática. Todos os direitos reservados.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function botao(texto: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
    <tr><td style="background:${COR_AZUL};border-radius:10px;padding:14px 32px;">
      <a href="${href}" style="color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;display:block;letter-spacing:0.3px;">${texto}</a>
    </td></tr>
  </table>`
}

function badge(texto: string, cor: string, bg: string): string {
  return `<span style="display:inline-block;background:${bg};color:${cor};font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:0.5px;">${texto}</span>`
}

function linhaItem(nome: string, qtd: number, preco: number): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">${nome}</td>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#6b7280;text-align:center;">×${qtd}</td>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:700;color:${COR_AZUL};text-align:right;">
      R$ ${(preco * qtd).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    </td>
  </tr>`
}

function formatarMoeda(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 1: Pedido Confirmado
// ─────────────────────────────────────────────────────────────
export type ItemEmail = { nome: string; quantidade: number; preco_unitario: number }

export function templatePedidoConfirmado(params: {
  numero: number
  nome: string
  itens: ItemEmail[]
  subtotal: number
  frete: number
  total: number
  endereco: { logradouro: string; numero: string; bairro: string; cidade: string; estado: string; cep: string }
}): { subject: string; html: string } {
  const numFormatado = String(params.numero).padStart(5, '0')
  const itensHtml = params.itens.map((i) => linhaItem(i.nome, i.quantidade, i.preco_unitario)).join('')

  const conteudo = `
    <!-- Saudação -->
    <h1 style="margin:0 0 4px;font-size:24px;font-weight:900;color:${COR_AZUL};">Pedido confirmado! 🎉</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">Olá, <strong style="color:#374151;">${params.nome}</strong>! Recebemos o seu pedido com sucesso.</p>

    <!-- Badge número do pedido -->
    <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #bfdbfe;border-radius:12px;padding:20px 24px;margin-bottom:28px;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#3b82f6;letter-spacing:1px;">NÚMERO DO SEU PEDIDO</p>
      <p style="margin:0;font-size:32px;font-weight:900;color:${COR_AZUL};letter-spacing:2px;font-family:monospace;">#${numFormatado}</p>
    </div>

    <!-- Itens do pedido -->
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Itens do pedido</h2>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:8px;">
      <thead>
        <tr>
          <th style="padding:0 0 8px;font-size:11px;font-weight:600;color:#9ca3af;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Produto</th>
          <th style="padding:0 0 8px;font-size:11px;font-weight:600;color:#9ca3af;text-align:center;text-transform:uppercase;letter-spacing:0.5px;">Qtd</th>
          <th style="padding:0 0 8px;font-size:11px;font-weight:600;color:#9ca3af;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Valor</th>
        </tr>
      </thead>
      <tbody>${itensHtml}</tbody>
    </table>

    <!-- Totais -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b7280;">Subtotal</td>
        <td style="padding:6px 0;font-size:13px;color:#6b7280;text-align:right;">${formatarMoeda(params.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b7280;">Frete</td>
        <td style="padding:6px 0;font-size:13px;color:#6b7280;text-align:right;">
          ${params.frete === 0 ? '<span style="color:#16a34a;font-weight:700;">Grátis</span>' : formatarMoeda(params.frete)}
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;font-size:16px;font-weight:900;color:${COR_AZUL};border-top:2px solid #e5e7eb;">Total pago</td>
        <td style="padding:10px 0 0;font-size:16px;font-weight:900;color:${COR_AZUL};text-align:right;border-top:2px solid #e5e7eb;">${formatarMoeda(params.total)}</td>
      </tr>
    </table>

    <!-- Endereço de entrega -->
    <div style="background:#f8f9fc;border-radius:12px;padding:20px 24px;margin-bottom:32px;border-left:4px solid ${COR_DOURADO};">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">📦 Endereço de entrega</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
        ${params.endereco.logradouro}, ${params.endereco.numero}<br/>
        ${params.endereco.bairro} — ${params.endereco.cidade}/${params.endereco.estado}<br/>
        CEP ${params.endereco.cep}
      </p>
    </div>

    <!-- Status -->
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin-bottom:32px;">
      <p style="margin:0;font-size:13px;color:#92400e;">
        ⏳ <strong>Próximo passo:</strong> Assim que o pagamento for confirmado pelo Mercado Pago, você receberá um novo e-mail de confirmação.
      </p>
    </div>

    <!-- CTA -->
    ${botao('Acompanhar meu pedido', `${SITE_URL}/conta`)}
  `

  return {
    subject: `Pedido #${numFormatado} confirmado — Ricarte Informática`,
    html: base(`Pedido #${numFormatado} confirmado`, conteudo),
  }
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 2: Pagamento Aprovado
// ─────────────────────────────────────────────────────────────
export function templatePagamentoAprovado(params: {
  numero: number
  nome: string
  total: number
  itens: ItemEmail[]
  pagamento_metodo?: string | null
}): { subject: string; html: string } {
  const numFormatado = String(params.numero).padStart(5, '0')
  const itensHtml = params.itens.map((i) => linhaItem(i.nome, i.quantidade, i.preco_unitario)).join('')

  const metodoLabel: Record<string, string> = {
    credit_card: 'Cartão de crédito',
    debit_card: 'Cartão de débito',
    pix: 'PIX',
    ticket: 'Boleto bancário',
  }
  const metodo = params.pagamento_metodo ? (metodoLabel[params.pagamento_metodo] ?? params.pagamento_metodo) : null

  const conteudo = `
    <!-- Ícone de sucesso -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:72px;height:72px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);border-radius:50%;line-height:72px;font-size:36px;">✅</div>
    </div>

    <h1 style="margin:0 0 4px;font-size:24px;font-weight:900;color:#16a34a;text-align:center;">Pagamento aprovado!</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#6b7280;text-align:center;">
      Ótima notícia, <strong style="color:#374151;">${params.nome}</strong>! Seu pagamento foi confirmado e o pedido já está sendo preparado.
    </p>

    <!-- Card do pedido -->
    <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #bfdbfe;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td>
            <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#3b82f6;letter-spacing:1px;">PEDIDO</p>
            <p style="margin:0;font-size:24px;font-weight:900;color:${COR_AZUL};font-family:monospace;">#${numFormatado}</p>
          </td>
          <td style="text-align:right;">
            <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#3b82f6;letter-spacing:1px;">TOTAL</p>
            <p style="margin:0;font-size:24px;font-weight:900;color:${COR_AZUL};">${formatarMoeda(params.total)}</p>
          </td>
        </tr>
        ${metodo ? `<tr><td colspan="2" style="padding-top:12px;font-size:13px;color:#6b7280;">💳 Pago via <strong>${metodo}</strong></td></tr>` : ''}
      </table>
    </div>

    <!-- Itens -->
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Itens do pedido</h2>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tbody>${itensHtml}</tbody>
    </table>

    <!-- Timeline de status -->
    <div style="border-radius:12px;border:1px solid #e5e7eb;padding:20px 24px;margin-bottom:32px;">
      <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#374151;">📋 Acompanhamento do pedido</p>
      <table cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="padding:4px 0;font-size:13px;">
            <span style="display:inline-block;width:20px;height:20px;background:#16a34a;border-radius:50%;text-align:center;line-height:20px;font-size:11px;color:white;margin-right:10px;vertical-align:middle;">✓</span>
            <strong style="color:#16a34a;">Pagamento aprovado</strong>
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0 4px 10px;border-left:2px solid #e5e7eb;margin-left:9px;height:16px;"></td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;">
            <span style="display:inline-block;width:20px;height:20px;background:${COR_DOURADO};border-radius:50%;text-align:center;line-height:20px;font-size:11px;color:white;margin-right:10px;vertical-align:middle;">⏳</span>
            <strong style="color:#92400e;">Em separação</strong>
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0 4px 10px;border-left:2px dashed #e5e7eb;height:16px;"></td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#9ca3af;">
            <span style="display:inline-block;width:20px;height:20px;background:#e5e7eb;border-radius:50%;text-align:center;line-height:20px;font-size:11px;color:#9ca3af;margin-right:10px;vertical-align:middle;">📦</span>
            Enviado
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0 4px 10px;border-left:2px dashed #e5e7eb;height:16px;"></td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#9ca3af;">
            <span style="display:inline-block;width:20px;height:20px;background:#e5e7eb;border-radius:50%;text-align:center;line-height:20px;font-size:11px;color:#9ca3af;margin-right:10px;vertical-align:middle;">🏠</span>
            Entregue
          </td>
        </tr>
      </table>
    </div>

    ${botao('Ver meu pedido', `${SITE_URL}/conta`)}
  `

  return {
    subject: `✅ Pagamento aprovado — Pedido #${numFormatado}`,
    html: base(`Pagamento aprovado — #${numFormatado}`, conteudo),
  }
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 3: Pedido Enviado
// ─────────────────────────────────────────────────────────────
export function templatePedidoEnviado(params: {
  numero: number
  nome: string
  codigo_rastreio: string
  itens: ItemEmail[]
  endereco: { logradouro: string; numero: string; bairro: string; cidade: string; estado: string; cep: string }
}): { subject: string; html: string } {
  const numFormatado = String(params.numero).padStart(5, '0')
  const itensHtml = params.itens.map((i) => linhaItem(i.nome, i.quantidade, i.preco_unitario)).join('')
  const urlRastreio = `https://rastreamento.correios.com.br/app/index.php?objeto=${params.codigo_rastreio}`

  const conteudo = `
    <!-- Ícone -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:72px;height:72px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-radius:50%;line-height:72px;font-size:36px;">📦</div>
    </div>

    <h1 style="margin:0 0 4px;font-size:24px;font-weight:900;color:${COR_AZUL};text-align:center;">Seu pedido saiu para entrega!</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#6b7280;text-align:center;">
      <strong style="color:#374151;">${params.nome}</strong>, seu pedido #${numFormatado} foi despachado e está a caminho!
    </p>

    <!-- Código de rastreio em destaque -->
    <div style="background:linear-gradient(135deg,${COR_AZUL},#003E8A);border-radius:14px;padding:28px;margin-bottom:28px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Código de rastreio</p>
      <p style="margin:0 0 16px;font-size:28px;font-weight:900;color:#ffffff;font-family:monospace;letter-spacing:3px;">${params.codigo_rastreio}</p>
      <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
        <tr><td style="background:${COR_DOURADO};border-radius:8px;padding:12px 28px;">
          <a href="${urlRastreio}" style="color:${COR_AZUL};font-size:13px;font-weight:800;text-decoration:none;letter-spacing:0.3px;">🔍 Rastrear agora nos Correios</a>
        </td></tr>
      </table>
    </div>

    <!-- Endereço destino -->
    <div style="background:#f8f9fc;border-radius:12px;padding:20px 24px;margin-bottom:28px;border-left:4px solid ${COR_DOURADO};">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">📍 Entregando em</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
        ${params.endereco.logradouro}, ${params.endereco.numero}<br/>
        ${params.endereco.bairro} — ${params.endereco.cidade}/${params.endereco.estado}<br/>
        CEP ${params.endereco.cep}
      </p>
    </div>

    <!-- Itens -->
    <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Itens enviados</h2>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tbody>${itensHtml}</tbody>
    </table>

    <!-- Dica de rastreio -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:32px;">
      <p style="margin:0;font-size:13px;color:#15803d;">
        💡 <strong>Dica:</strong> O código pode levar até 2 dias úteis para aparecer no sistema dos Correios. Fique atento ao seu e-mail para novidades.
      </p>
    </div>

    ${botao('Acompanhar meu pedido', `${SITE_URL}/conta`)}
  `

  return {
    subject: `📦 Pedido #${numFormatado} enviado — Rastreie agora!`,
    html: base(`Pedido #${numFormatado} enviado`, conteudo),
  }
}
