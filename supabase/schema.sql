-- ============================================================
-- RINFO — Ricarte Informática | Schema do banco de dados
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ============================================================
-- PERFIS DE USUÁRIO
-- Espelha auth.users do Supabase, com dados extras
-- ============================================================
create table public.perfis (
  id          uuid references auth.users(id) on delete cascade primary key,
  nome        text,
  telefone    text,
  cpf         text unique,
  role        text not null default 'cliente' check (role in ('cliente', 'admin')),
  criado_em   timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Cria perfil automaticamente ao registrar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, new.raw_user_meta_data->>'nome');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ENDEREÇOS
-- ============================================================
create table public.enderecos (
  id          uuid default uuid_generate_v4() primary key,
  perfil_id   uuid references public.perfis(id) on delete cascade not null,
  apelido     text,                        -- ex: "Casa", "Trabalho"
  cep         text not null,
  logradouro  text not null,
  numero      text not null,
  complemento text,
  bairro      text not null,
  cidade      text not null,
  estado      char(2) not null,
  principal   boolean default false,
  criado_em   timestamptz default now()
);

-- ============================================================
-- CATEGORIAS DE PRODUTOS
-- ============================================================
create table public.categorias (
  id          uuid default uuid_generate_v4() primary key,
  nome        text not null,
  slug        text not null unique,
  descricao   text,
  imagem_url  text,
  pai_id      uuid references public.categorias(id),  -- subcategorias
  ativo       boolean default true,
  ordem       integer default 0
);

-- Seeds de categorias iniciais
insert into public.categorias (nome, slug, ordem) values
  ('Computadores', 'computadores', 1),
  ('Notebooks', 'notebooks', 2),
  ('Periféricos', 'perifericos', 3),
  ('Componentes', 'componentes', 4),
  ('Redes', 'redes', 5),
  ('Armazenamento', 'armazenamento', 6),
  ('Acessórios', 'acessorios', 7),
  ('Serviços', 'servicos', 8);

-- ============================================================
-- FORNECEDORES (para dropshipping)
-- ============================================================
create table public.fornecedores (
  id          uuid default uuid_generate_v4() primary key,
  nome        text not null,
  cnpj        text unique,
  contato     text,
  email       text,
  telefone    text,
  site        text,
  ativo       boolean default true,
  criado_em   timestamptz default now()
);

-- ============================================================
-- PRODUTOS
-- ============================================================
create table public.produtos (
  id              uuid default uuid_generate_v4() primary key,
  nome            text not null,
  slug            text not null unique,
  descricao       text,
  descricao_curta text,
  preco           numeric(10,2) not null check (preco >= 0),
  preco_original  numeric(10,2),            -- para mostrar desconto
  sku             text unique,
  categoria_id    uuid references public.categorias(id),
  fornecedor_id   uuid references public.fornecedores(id),
  estoque_fisico  integer default 0,        -- estoque na loja
  dropshipping    boolean default false,    -- se true, sem estoque físico
  ativo           boolean default true,
  destaque        boolean default false,
  peso_kg         numeric(6,3),             -- para cálculo de frete
  altura_cm       numeric(6,1),
  largura_cm      numeric(6,1),
  comprimento_cm  numeric(6,1),
  criado_em       timestamptz default now(),
  atualizado_em   timestamptz default now()
);

-- ============================================================
-- IMAGENS DE PRODUTOS
-- ============================================================
create table public.produto_imagens (
  id          uuid default uuid_generate_v4() primary key,
  produto_id  uuid references public.produtos(id) on delete cascade not null,
  url         text not null,
  alt         text,
  principal   boolean default false,
  ordem       integer default 0
);

-- ============================================================
-- ESPECIFICAÇÕES TÉCNICAS (chave-valor por produto)
-- ============================================================
create table public.produto_specs (
  id          uuid default uuid_generate_v4() primary key,
  produto_id  uuid references public.produtos(id) on delete cascade not null,
  chave       text not null,    -- ex: "Processador", "RAM", "Armazenamento"
  valor       text not null,    -- ex: "Intel i5 12ª Gen", "16GB DDR4"
  ordem       integer default 0
);

-- ============================================================
-- PEDIDOS
-- ============================================================
create type public.status_pedido as enum (
  'aguardando_pagamento',
  'pagamento_aprovado',
  'em_separacao',
  'enviado',
  'entregue',
  'cancelado',
  'reembolsado'
);

create type public.tipo_entrega as enum (
  'entrega_cidade',    -- entrega local pela Ricarte
  'correios',
  'jadlog',
  'retirada_loja'
);

create table public.pedidos (
  id                  uuid default uuid_generate_v4() primary key,
  numero              serial unique,          -- número legível: #1, #2...
  perfil_id           uuid references public.perfis(id),
  status              public.status_pedido default 'aguardando_pagamento',
  tipo_entrega        public.tipo_entrega,
  endereco_entrega    jsonb,                  -- snapshot do endereço no momento da compra
  subtotal            numeric(10,2) not null,
  frete               numeric(10,2) default 0,
  desconto            numeric(10,2) default 0,
  total               numeric(10,2) not null,
  observacao          text,
  codigo_rastreio     text,
  pagamento_id        text,                   -- ID da transação no Mercado Pago
  pagamento_metodo    text,                   -- 'pix', 'credito', 'boleto'
  criado_em           timestamptz default now(),
  atualizado_em       timestamptz default now()
);

-- ============================================================
-- ITENS DO PEDIDO
-- ============================================================
create table public.pedido_itens (
  id              uuid default uuid_generate_v4() primary key,
  pedido_id       uuid references public.pedidos(id) on delete cascade not null,
  produto_id      uuid references public.produtos(id),
  nome_produto    text not null,              -- snapshot do nome
  preco_unitario  numeric(10,2) not null,     -- snapshot do preço
  quantidade      integer not null check (quantidade > 0),
  subtotal        numeric(10,2) not null
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Garante que cada cliente só vê seus próprios dados
-- ============================================================
alter table public.perfis          enable row level security;
alter table public.enderecos       enable row level security;
alter table public.pedidos         enable row level security;
alter table public.pedido_itens    enable row level security;
alter table public.produtos        enable row level security;
alter table public.categorias      enable row level security;
alter table public.produto_imagens enable row level security;
alter table public.produto_specs   enable row level security;
alter table public.fornecedores    enable row level security;

-- Perfis: usuário lê/edita apenas o próprio
create policy "perfil_proprio" on public.perfis
  for all using (auth.uid() = id);

-- Endereços: usuário acessa apenas os próprios
create policy "enderecos_proprios" on public.enderecos
  for all using (auth.uid() = perfil_id);

-- Pedidos: usuário acessa apenas os próprios
create policy "pedidos_proprios" on public.pedidos
  for all using (auth.uid() = perfil_id);

create policy "pedido_itens_proprios" on public.pedido_itens
  for all using (
    exists (
      select 1 from public.pedidos
      where id = pedido_itens.pedido_id and perfil_id = auth.uid()
    )
  );

-- Produtos, categorias, imagens, specs: leitura pública
create policy "produtos_publicos" on public.produtos
  for select using (ativo = true);

create policy "categorias_publicas" on public.categorias
  for select using (ativo = true);

create policy "imagens_publicas" on public.produto_imagens
  for select using (true);

create policy "specs_publicas" on public.produto_specs
  for select using (true);

-- Admin: acesso total (via role no perfil)
create policy "admin_perfis" on public.perfis
  for all using (
    exists (select 1 from public.perfis where id = auth.uid() and role = 'admin')
  );

create policy "admin_produtos" on public.produtos
  for all using (
    exists (select 1 from public.perfis where id = auth.uid() and role = 'admin')
  );

create policy "admin_pedidos" on public.pedidos
  for all using (
    exists (select 1 from public.perfis where id = auth.uid() and role = 'admin')
  );

create policy "admin_fornecedores" on public.fornecedores
  for all using (
    exists (select 1 from public.perfis where id = auth.uid() and role = 'admin')
  );
