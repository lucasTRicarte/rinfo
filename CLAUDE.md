@AGENTS.md

# rinfo — Ricarte Informática E-commerce

Plataforma e-commerce completa para a **Ricarte Informática**, empresa de TI/informática.
Desenvolvida por Lucas Ricarte (filho do dono) com Claude Code.

## Stack
- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS
- **Banco de dados:** a definir (Prisma + PostgreSQL recomendado)
- **Autenticação:** a definir (NextAuth.js recomendado)
- **Pagamentos:** a definir (Stripe / Mercado Pago)

## Estrutura de pastas

```
src/
  app/
    (shop)/          # Loja pública (layout compartilhado)
      produtos/      # Catálogo e página de produto
      carrinho/      # Carrinho de compras
      checkout/      # Fluxo de finalização de compra
      conta/         # Área do cliente logado
      busca/         # Busca e filtros
    admin/           # Painel administrativo (protegido)
      produtos/      # Gerenciar produtos
      pedidos/       # Gerenciar pedidos
      clientes/      # Gerenciar clientes
      configuracoes/ # Config da loja
    auth/            # Autenticação
    api/             # API Routes do Next.js
  components/
    ui/              # Componentes base reutilizáveis
    layout/          # Header, Footer, Nav
    produto/         # Cards, galeria, ficha de produto
    carrinho/        # Drawer, mini-cart
    checkout/        # Steps, formulários
    admin/           # Componentes do painel admin
  lib/
    db/              # Cliente Prisma
    auth/            # Configuração de autenticação
    email/           # E-mails transacionais
    pagamento/       # Gateway de pagamento
    upload/          # Upload de imagens
  types/             # Tipos globais (Produto, Pedido, Cliente...)
  hooks/             # Custom hooks React
  context/           # Providers (Carrinho, Auth...)
```

## Domínio do negócio

A Ricarte Informática é uma empresa de TI. Catálogo inclui computadores, notebooks,
periféricos, componentes, serviços de manutenção e acessórios.

## Convenções

- Componentes: PascalCase (`ProductCard.tsx`)
- Hooks/funções: camelCase (`useCart.ts`)
- Rotas: kebab-case (`recuperar-senha/`)
- Português para entidades de domínio (Pedido, Produto), inglês para código técnico
- Sem comentários óbvios

## Comandos

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run lint     # Linting
```
