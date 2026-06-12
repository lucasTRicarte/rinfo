@AGENTS.md

# rinfo — Ricarte Informática E-commerce

Plataforma e-commerce completa da **Ricarte Informática** (empresa de TI).
Desenvolvida por Lucas Ricarte (filho do dono) com Claude Code.
Repositório: github.com/lucasTRicarte/rinfo

---

## Stack real (já em uso)

- **Framework:** Next.js 16 (App Router, não Next.js 15 como indicado originalmente)
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS v4
- **Banco de dados:** Supabase (PostgreSQL + RLS + Storage)
- **Autenticação:** Supabase Auth (email/senha)
- **Pagamentos:** Mercado Pago (Checkout Pro)
- **E-mails:** Resend (`src/lib/email/`)

---

## O que já foi implementado

### Fase 1 — base completa
- Painel admin (`/admin`): categorias, produtos, pedidos, estoque, clientes, fornecedores, cupons, avaliações
- Loja pública: catálogo, página de produto, carrinho, checkout, conta do cliente
- Autenticação completa: login, cadastro, recuperar senha
- Integração Mercado Pago Checkout Pro + webhook de status
- Upload de imagens para Supabase Storage
- E-mails transacionais via Resend (confirmação de pedido, pedido enviado)
- SEO básico: `robots.ts`, `sitemap.ts`

### Fase 2 — funcionalidades do cliente (completa)
- **Herança de categoria:** produto em "notebook gaming" aparece ao filtrar por "notebook"; cupom de "notebook" aplica desconto ao produto da subcategoria
- **Frete por CEP:** ViaCEP + tabela PAC/SEDEX por zona geográfica (origem: Campina Grande/PB)
- **Entrega local:** Campina Grande/PB = R$15 fixo até 5 kg, +R$2/kg acima
- **frete_servico salvo no pedido:** admin vê "PAC · R$ 38,50" ou "Entrega Local · R$ 15,00"
- **Menu suspenso com subcategorias** — posicionado via `getBoundingClientRect` para não ser cortado por `overflow-x: auto`
- **Sidebar de categorias** com árvore expansível de subcategorias
- **Busca com autocomplete** em tempo real (debounce 300ms, até 5 resultados com imagem/nome/preço)
- **Perfil editável** em `/conta`: nome, telefone, foto (upload para Supabase Storage)
- **Gerenciamento de endereços** em `/conta`: cadastrar, editar, excluir, definir como principal
- **Pré-preenchimento no checkout:** endereços salvos aparecem como opções; selecionar um preenche os campos e calcula o frete automaticamente

---

## Arquivos-chave

```
src/
  app/
    admin/              # Painel admin (categorias, produtos, pedidos, cupons, avaliações…)
    auth/               # login, cadastro, recuperar-senha
    checkout/           # page.tsx + sucesso|falha|pendente
    conta/              # page.tsx — pedidos, perfil, endereços
    produtos/           # page.tsx + ProdutosPageClient.tsx + [slug]/
    api/webhook/mercadopago/route.ts
    robots.ts / sitemap.ts
  components/layout/
    Header.tsx          # busca com autocomplete
    NavMenu.tsx         # menu com dropdown de subcategorias
    ShopLayout.tsx      # layout da loja (síncrono — não tornar async)
  lib/
    admin/pedidos.ts
    auth/actions.ts
    db/supabase/client.ts + server.ts + service.ts
    email/index.ts + templates.ts
    loja/
      categorias.ts     # listarCategoriasComSubs()
      cupons.ts         # validação com herança de categoria
      enderecos.ts      # CRUD de endereços do cliente
      frete.ts          # calcularFrete() + calcularFreteLocal() + buscarCep()
      pedidos.ts        # criarPedido() + iniciarCheckout() + listarMeusPedidos()
      produtos.ts       # busca com herança de categoria pai→filho
    pagamento/mercadopago.ts
  supabase/schema.sql   # schema completo — usar para recriar o banco do zero
  types/database.ts
```

---

## Supabase

- Projeto: zxgoxaxscqpfbukyTlyo (credenciais em `.env.local`)
- UUID admin do Lucas: `b05f8cc3-ad31-4730-950a-2b17eb7bb2cc` (role = 'admin' na tabela perfis)
- Função `public.is_admin()` com `security definer` — usada nas políticas RLS para evitar recursão (erro 42P17)
- Bucket `imagens` no Storage: leitura pública, upload autenticado

### SQL pendente — rodar no SQL Editor do Supabase antes de testar
```sql
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS frete_servico text;
ALTER TABLE public.cupons ADD COLUMN IF NOT EXISTS categoria_ids uuid[];
ALTER TABLE public.cupons ADD COLUMN IF NOT EXISTS uso_por_perfil boolean NOT NULL DEFAULT false;
```

---

## Mercado Pago

- Fluxo: Checkout Pro → cliente redirecionado para `init_point` → webhook POST em `/api/webhook/mercadopago` atualiza status no Supabase via service client
- Back URLs: `{NEXT_PUBLIC_SITE_URL}/checkout/sucesso|falha|pendente`
- Credenciais em `.env.local` (ACCESS_TOKEN começa com `APP_USR-`, são credenciais de produção)
- Webhook em produção: configurar URL no painel do MP apontando para o domínio real

---

## E-mail (Resend)

- Remetente atual: `onboarding@resend.dev` — no plano gratuito sem domínio verificado, os e-mails só chegam para o dono da conta Resend, não para clientes reais
- **Pendência:** quando o domínio `ricarteinformatica.com.br` estiver disponível, verificar no painel do Resend e atualizar `RESEND_FROM` no `.env.local`

---

## Próximos passos (Fase 3)

- Avaliações públicas de produtos (UI na página do produto — backend já existe em `lib/loja/avaliacoes.ts`)
- Tracking de rastreio visível para o cliente em `/conta` (campo `codigo_rastreio` já existe no pedido)
- Paginação real no catálogo (Supabase count + range)
- Schema.org para produtos (structured data para SEO)
- Filtro de preço com slider no catálogo

---

## Convenções de código

- Componentes: PascalCase (`ProductCard.tsx`)
- Hooks/funções: camelCase (`useCart.ts`)
- Rotas: kebab-case (`recuperar-senha/`)
- Português para entidades de domínio (Pedido, Produto), inglês para código técnico
- Sem comentários óbvios
- `ShopLayout` deve permanecer síncrono — torná-lo `async` quebra páginas client que o importam diretamente

## Preferências de trabalho do Lucas

- Testa cada funcionalidade antes de pedir a próxima — não adiantar fases sem confirmação
- Descreve bugs pelo comportamento visual (ex: "botão volta ao normal sem erro") — sempre adicionar `try/catch` com `setErro()` visível em formulários, nunca deixar exceções dentro de `startTransition` sem captura
- Fornece tokens e chaves diretamente no chat para atualizar o `.env.local`

## Comandos

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run lint     # Linting
```
