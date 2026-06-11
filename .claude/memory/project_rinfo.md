---
name: project-rinfo
description: "Estado atual do e-commerce rinfo — o que foi construído, estrutura e próximos passos"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1c89d0e8-b05c-479a-9f12-87f1cb7f504e
---

E-commerce completo da Ricarte Informática. Repositório: github.com/lucasTRicarte/rinfo. Stack: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Supabase, Mercado Pago.

## O que foi implementado (Fase 1 completa)

**Admin:**
- `src/app/admin/` — painel com categorias, produtos, pedidos, estoque, clientes, fornecedores
- `src/lib/admin/` — server actions para cada entidade
- `src/components/admin/ImageUploader.tsx` — upload de imagens para Supabase Storage

**Loja pública:**
- `src/app/produtos/page.tsx` — catálogo com filtros por categoria e preço
- `src/app/produtos/[slug]/page.tsx` — página de produto com layout 3 colunas: galeria (58%) | descrição resumida sticky | sidebar sticky (466px) com título/preço/carrinho/calcular frete
- `src/app/carrinho/page.tsx` — carrinho de compras
- `src/app/checkout/page.tsx` — checkout integrado ao Mercado Pago
- `src/app/checkout/sucesso|pendente|falha/` — páginas de retorno do MP
- `src/app/conta/page.tsx` — área do cliente com pedidos reais

**Infraestrutura:**
- `src/context/CartContext.tsx` — carrinho com localStorage, IDs UUID
- `src/lib/loja/` — produtos, categorias, pedidos (server actions públicos)
- `src/lib/pagamento/mercadopago.ts` — Checkout Pro
- `src/app/api/webhook/mercadopago/route.ts` — webhook atualiza status do pedido
- `src/lib/db/supabase/service.ts` — client com service role para webhook

## Próximos passos (Fase 2)
- Perfil do cliente editável (salvar no Supabase)
- Gerenciamento de endereços
- Cálculo de frete por CEP (Correios / ViaCEP) — campo visual já existe na página de produto
- E-mails transacionais (Resend) — confirmação de pedido, pagamento aprovado, enviado

## Fase 3 (futura)
- SEO (metadata dinâmica, sitemap, Schema.org)
- Sistema de avaliações de produtos
- Busca avançada com paginação real
- Cupons de desconto
