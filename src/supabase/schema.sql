-- ============================================================
-- Ricarte Informática — Schema Supabase
-- Executar no SQL Editor do Supabase
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ============================================================
-- PERFIS (extends auth.users)
-- ============================================================
create table if not exists perfis (
  id uuid references auth.users(id) on delete cascade primary key,
  nome text,
  telefone text,
  cpf text,
  foto_url text,
  role text not null default 'cliente' check (role in ('cliente', 'admin')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Auto-criar perfil ao cadastrar usuário
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into perfis (id, nome)
  values (new.id, new.raw_user_meta_data->>'nome');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ENDEREÇOS
-- ============================================================
create table if not exists enderecos (
  id uuid primary key default uuid_generate_v4(),
  perfil_id uuid references perfis(id) on delete cascade not null,
  apelido text,
  cep text not null,
  logradouro text not null,
  numero text not null,
  complemento text,
  bairro text not null,
  cidade text not null,
  estado char(2) not null,
  principal boolean not null default false,
  criado_em timestamptz not null default now()
);

-- ============================================================
-- CATEGORIAS (hierárquicas — pai_id para subcategorias)
-- ============================================================
create table if not exists categorias (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  slug text not null unique,
  descricao text,
  imagem_url text,
  pai_id uuid references categorias(id) on delete set null,
  ativo boolean not null default true,
  ordem integer not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ============================================================
-- FORNECEDORES
-- ============================================================
create table if not exists fornecedores (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cnpj text,
  contato text,
  email text,
  telefone text,
  site text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- ============================================================
-- PRODUTOS
-- ============================================================
create table if not exists produtos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  slug text not null unique,
  descricao text,
  descricao_curta text,
  preco numeric(10,2) not null check (preco >= 0),
  preco_original numeric(10,2) check (preco_original >= 0),
  badge text check (badge in ('MAIS VENDIDO', 'PROMOÇÃO', 'NOVO')),
  sku text,
  categoria_id uuid references categorias(id) on delete set null,
  fornecedor_id uuid references fornecedores(id) on delete set null,
  estoque_fisico integer not null default 0 check (estoque_fisico >= 0),
  dropshipping boolean not null default false,
  ativo boolean not null default true,
  destaque boolean not null default false,
  peso_kg numeric(6,3),
  altura_cm numeric(6,1),
  largura_cm numeric(6,1),
  comprimento_cm numeric(6,1),
  avaliacao_media numeric(2,1) not null default 0,
  total_avaliacoes integer not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ============================================================
-- PRODUTO IMAGENS
-- ============================================================
create table if not exists produto_imagens (
  id uuid primary key default uuid_generate_v4(),
  produto_id uuid references produtos(id) on delete cascade not null,
  url text not null,
  alt text,
  principal boolean not null default false,
  ordem integer not null default 0
);

-- ============================================================
-- PRODUTO SPECS (especificações técnicas)
-- ============================================================
create table if not exists produto_specs (
  id uuid primary key default uuid_generate_v4(),
  produto_id uuid references produtos(id) on delete cascade not null,
  chave text not null,
  valor text not null,
  ordem integer not null default 0
);

-- ============================================================
-- PEDIDOS
-- ============================================================
create table if not exists pedidos (
  id uuid primary key default uuid_generate_v4(),
  numero serial not null,
  perfil_id uuid references perfis(id) on delete set null,
  status text not null default 'aguardando_pagamento'
    check (status in ('aguardando_pagamento','pagamento_aprovado','em_separacao','enviado','entregue','cancelado','reembolsado')),
  tipo_entrega text check (tipo_entrega in ('entrega_cidade','correios','jadlog','retirada_loja')),
  endereco_entrega jsonb,
  subtotal numeric(10,2) not null,
  frete numeric(10,2) not null default 0,
  desconto numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  observacao text,
  codigo_rastreio text,
  pagamento_id text,
  pagamento_metodo text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ============================================================
-- PEDIDO ITENS
-- ============================================================
create table if not exists pedido_itens (
  id uuid primary key default uuid_generate_v4(),
  pedido_id uuid references pedidos(id) on delete cascade not null,
  produto_id uuid references produtos(id) on delete set null,
  nome_produto text not null,
  preco_unitario numeric(10,2) not null,
  quantidade integer not null check (quantidade > 0),
  subtotal numeric(10,2) not null
);

-- ============================================================
-- TRIGGER: atualizado_em automático
-- ============================================================
create or replace function set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  create trigger trg_perfis_atualizado
    before update on perfis for each row execute function set_atualizado_em();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_categorias_atualizado
    before update on categorias for each row execute function set_atualizado_em();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_produtos_atualizado
    before update on produtos for each row execute function set_atualizado_em();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_pedidos_atualizado
    before update on pedidos for each row execute function set_atualizado_em();
exception when duplicate_object then null; end $$;

-- ============================================================
-- RLS — Row Level Security
-- ============================================================
alter table perfis enable row level security;
alter table enderecos enable row level security;
alter table categorias enable row level security;
alter table fornecedores enable row level security;
alter table produtos enable row level security;
alter table produto_imagens enable row level security;
alter table produto_specs enable row level security;
alter table pedidos enable row level security;
alter table pedido_itens enable row level security;

-- Perfis: cada usuário vê e edita apenas o próprio
create policy "perfis_select_own" on perfis for select using (auth.uid() = id);
create policy "perfis_update_own" on perfis for update using (auth.uid() = id);

-- Admin acessa tudo
create policy "admin_all_perfis"     on perfis     for all using (exists (select 1 from perfis where id = auth.uid() and role = 'admin'));
create policy "admin_all_enderecos"  on enderecos  for all using (exists (select 1 from perfis where id = auth.uid() and role = 'admin'));
create policy "admin_all_produtos"   on produtos   for all using (exists (select 1 from perfis where id = auth.uid() and role = 'admin'));
create policy "admin_all_imagens"    on produto_imagens for all using (exists (select 1 from perfis where id = auth.uid() and role = 'admin'));
create policy "admin_all_specs"      on produto_specs  for all using (exists (select 1 from perfis where id = auth.uid() and role = 'admin'));
create policy "admin_all_categorias" on categorias for all using (exists (select 1 from perfis where id = auth.uid() and role = 'admin'));
create policy "admin_all_fornecedores" on fornecedores for all using (exists (select 1 from perfis where id = auth.uid() and role = 'admin'));
create policy "admin_all_pedidos"    on pedidos    for all using (exists (select 1 from perfis where id = auth.uid() and role = 'admin'));
create policy "admin_all_pedido_itens" on pedido_itens for all using (exists (select 1 from perfis where id = auth.uid() and role = 'admin'));

-- Público lê categorias e produtos ativos
create policy "publico_categorias" on categorias for select using (ativo = true);
create policy "publico_produtos"   on produtos   for select using (ativo = true);
create policy "publico_imagens"    on produto_imagens for select using (true);
create policy "publico_specs"      on produto_specs   for select using (true);

-- Clientes gerenciam seus próprios dados
create policy "cliente_enderecos"  on enderecos  for all using (perfil_id = auth.uid());
create policy "cliente_pedidos"    on pedidos    for select using (perfil_id = auth.uid());
create policy "cliente_itens"      on pedido_itens for select using (
  exists (select 1 from pedidos where id = pedido_id and perfil_id = auth.uid())
);

-- ============================================================
-- AVALIAÇÕES DE PRODUTOS
-- ============================================================
create table if not exists avaliacoes (
  id uuid primary key default uuid_generate_v4(),
  produto_id uuid references produtos(id) on delete cascade not null,
  perfil_id uuid references perfis(id) on delete cascade not null,
  nota smallint not null check (nota between 1 and 5),
  titulo text,
  comentario text not null,
  aprovado boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (produto_id, perfil_id)
);

alter table avaliacoes enable row level security;
create policy "avaliacoes_publico_select" on avaliacoes for select using (aprovado = true);
create policy "avaliacoes_cliente_insert" on avaliacoes for insert with check (auth.uid() = perfil_id);
create policy "avaliacoes_cliente_delete" on avaliacoes for delete using (auth.uid() = perfil_id);
create policy "avaliacoes_admin_all" on avaliacoes for all using (exists (select 1 from perfis where id = auth.uid() and role = 'admin'));

-- Trigger: recalcula média e total no produto ao inserir/atualizar/excluir avaliação
create or replace function atualizar_media_avaliacoes()
returns trigger as $$
declare v_produto_id uuid;
begin
  v_produto_id := coalesce(new.produto_id, old.produto_id);
  update produtos set
    avaliacao_media = coalesce((select round(avg(nota)::numeric, 1) from avaliacoes where produto_id = v_produto_id and aprovado = true), 0),
    total_avaliacoes = (select count(*) from avaliacoes where produto_id = v_produto_id and aprovado = true)
  where id = v_produto_id;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

do $$ begin
  create trigger trg_avaliacoes_media
    after insert or update or delete on avaliacoes
    for each row execute function atualizar_media_avaliacoes();
exception when duplicate_object then null; end $$;

-- ============================================================
-- CUPONS DE DESCONTO
-- ============================================================
create table if not exists cupons (
  id uuid primary key default uuid_generate_v4(),
  codigo text not null unique,
  desconto_tipo text not null check (desconto_tipo in ('percentual', 'fixo')),
  desconto_valor numeric(10,2) not null check (desconto_valor > 0),
  valido_ate date,
  ativo boolean not null default true,
  uso_maximo integer,
  uso_atual integer not null default 0,
  valor_minimo numeric(10,2),
  criado_em timestamptz not null default now()
);

alter table cupons enable row level security;
create policy "cupons_admin_all" on cupons for all using (exists (select 1 from perfis where id = auth.uid() and role = 'admin'));

-- Clientes podem ler cupons ativos (necessário para validação client-side)
create policy "cupons_publico_select" on cupons for select using (ativo = true);

-- Coluna cupom no pedido
alter table pedidos add column if not exists cupom_id uuid references cupons(id) on delete set null;
alter table pedidos add column if not exists cupom_codigo text;

-- Função RPC para incrementar uso de cupom de forma segura
create or replace function incrementar_uso_cupom(p_cupom_id uuid)
returns void as $$
begin
  update cupons set uso_atual = uso_atual + 1 where id = p_cupom_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
create index if not exists idx_produtos_categoria on produtos(categoria_id);
create index if not exists idx_produtos_slug on produtos(slug);
create index if not exists idx_produtos_ativo on produtos(ativo);
create index if not exists idx_categorias_pai on categorias(pai_id);
create index if not exists idx_categorias_slug on categorias(slug);
create index if not exists idx_pedidos_perfil on pedidos(perfil_id);
create index if not exists idx_pedidos_status on pedidos(status);
create index if not exists idx_pedido_itens_pedido on pedido_itens(pedido_id);

-- ============================================================
-- SEED: Categorias iniciais
-- ============================================================
insert into categorias (nome, slug, descricao, ordem) values
  ('Notebooks', 'notebooks', 'Notebooks para trabalho, estudos e entretenimento', 1),
  ('Computadores', 'computadores', 'Desktops e all-in-ones', 2),
  ('Periféricos', 'perifericos', 'Teclados, mouses, headsets e monitores', 3),
  ('Componentes', 'componentes', 'Processadores, memórias, SSDs e GPUs', 4),
  ('Redes', 'redes', 'Roteadores, switches e equipamentos de rede', 5),
  ('Impressoras', 'impressoras', 'Impressoras jato de tinta, laser e multifuncionais', 6),
  ('Acessórios', 'acessorios', 'Cabos, adaptadores e acessórios em geral', 7),
  ('Serviços', 'servicos', 'Manutenção, formatação e montagem', 8)
on conflict (slug) do nothing;

-- Subcategorias de Notebooks
with pai as (select id from categorias where slug = 'notebooks')
insert into categorias (nome, slug, descricao, pai_id, ordem) values
  ('Notebooks Gaming', 'notebooks-gaming', 'Alta performance para jogos', (select id from pai), 1),
  ('Notebooks Trabalho', 'notebooks-trabalho', 'Produtividade e mobilidade', (select id from pai), 2),
  ('Ultrabooks', 'notebooks-ultrabook', 'Ultrafinos e leves', (select id from pai), 3)
on conflict (slug) do nothing;

-- Subcategorias de Periféricos
with pai as (select id from categorias where slug = 'perifericos')
insert into categorias (nome, slug, descricao, pai_id, ordem) values
  ('Teclados', 'teclados', 'Teclados mecânicos e de membrana', (select id from pai), 1),
  ('Mouses', 'mouses', 'Mouses com fio e sem fio', (select id from pai), 2),
  ('Headsets', 'headsets', 'Fones gamer e profissionais', (select id from pai), 3),
  ('Monitores', 'monitores', 'Monitores Full HD, 4K e gamer', (select id from pai), 4),
  ('Webcams', 'webcams', 'Webcams HD e 4K', (select id from pai), 5)
on conflict (slug) do nothing;

-- Subcategorias de Componentes
with pai as (select id from categorias where slug = 'componentes')
insert into categorias (nome, slug, descricao, pai_id, ordem) values
  ('Processadores', 'processadores', 'Intel e AMD', (select id from pai), 1),
  ('Memória RAM', 'memoria-ram', 'DDR4 e DDR5', (select id from pai), 2),
  ('SSD e HD', 'ssd-hd', 'Armazenamento rápido e de alta capacidade', (select id from pai), 3),
  ('Placas de Vídeo', 'placas-video', 'GPUs NVIDIA e AMD', (select id from pai), 4),
  ('Fontes', 'fontes', 'Fontes certificadas 80 Plus', (select id from pai), 5),
  ('Gabinetes', 'gabinetes', 'Gabinetes ATX e compactos', (select id from pai), 6)
on conflict (slug) do nothing;
