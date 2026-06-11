---
name: project-supabase
description: "Configuração do Supabase, credenciais, correções de RLS e storage"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1c89d0e8-b05c-479a-9f12-87f1cb7f504e
---

## Credenciais (todas em .env.local)
- URL: https://zxgoxaxscqpfbukyTlyo.supabase.co
- ANON KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Z294YXhzY3FwZmJ1a3l0bHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDA2NjcsImV4cCI6MjA5NjYxNjY2N30.mpJpUOkVM0nRMxYw6YwGSJXfTBmdUwTdsowVrExYvAU
- SERVICE ROLE KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Z294YXhzY3FwZmJ1a3l0bHlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA0MDY2NywiZXhwIjoyMDk2NjE2NjY3fQ.1sQUMnvjo2XlTIYI4i1Z52UxEsXDAqKSXZB9JHEDJ6g

## Perfil admin do Lucas
- UUID: b05f8cc3-ad31-4730-950a-2b17eb7bb2cc
- role = 'admin' na tabela perfis (já configurado)

## Correções de RLS aplicadas no Supabase
1. Criada função `public.is_admin()` com `security definer` para evitar recursão infinita (erro 42P17)
2. Recriadas políticas `admin_all_*` em perfis, produtos, categorias, pedidos usando `is_admin()`
3. Removida política antiga `admin_perfis` que ainda tinha a query recursiva — era isso que causava o erro mesmo após o fix inicial
4. Bucket `imagens` criado no Storage com políticas de leitura pública e upload autenticado

## Colunas adicionadas manualmente à tabela produtos
A tabela foi criada com typo `sky` em vez de `sku`. Correções aplicadas:
```sql
ALTER TABLE public.produtos RENAME COLUMN sky TO sku;
ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS badge text CHECK (badge IN ('MAIS VENDIDO', 'PROMOÇÃO', 'NOVO')),
  ADD COLUMN IF NOT EXISTS avaliacao_media numeric(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_avaliacoes integer NOT NULL DEFAULT 0;
```

**Why:** A tabela foi criada antes do schema final ser definido, então estava faltando colunas.
**How to apply:** Se recriar o banco do zero, usar src/supabase/schema.sql que já tem tudo correto.
