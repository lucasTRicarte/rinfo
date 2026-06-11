---
name: project-mercadopago
description: Integração Mercado Pago — credenciais e fluxo implementado
metadata: 
  node_type: memory
  type: project
  originSessionId: 1c89d0e8-b05c-479a-9f12-87f1cb7f504e
---

## Credenciais
- ACCESS TOKEN: APP_USR-5806911719572795-061115-8ff51f46cc48edfc482f0da185bfe0d2-3467580028
- Tipo: produção (APP_USR = credencial de usuário real, não sandbox TEST-)

## Fluxo implementado (Checkout Pro)
1. Cliente confirma endereço e clica "Confirmar e Ir para Pagamento"
2. `iniciarCheckout()` em `src/lib/loja/pedidos.ts` salva pedido no Supabase (status: aguardando_pagamento) e cria preferência MP
3. Cliente é redirecionado para `init_point` (página do Mercado Pago)
4. MP redireciona para /checkout/sucesso | /pendente | /falha com query params
5. MP envia webhook POST para /api/webhook/mercadopago → atualiza status do pedido no Supabase via service client

## Back URLs configuradas
- Sucesso: {NEXT_PUBLIC_SITE_URL}/checkout/sucesso
- Falha: {NEXT_PUBLIC_SITE_URL}/checkout/falha
- Pendente: {NEXT_PUBLIC_SITE_URL}/checkout/pendente

## Webhook
- Para funcionar em produção: configurar URL do webhook no painel do MP apontando para o domínio real
- Em desenvolvimento: usar ngrok para expor localhost (ainda não configurado)
- O webhook usa `createServiceClient()` (service role) para atualizar pedidos sem contexto de auth
