-- Extensões úteis
create extension if not exists pgcrypto; -- para gen_random_uuid, crypt, digest
create extension if not exists pg_trgm;  -- opcional, pesquisas textuais

-- PREFEITURAS
create table public.prefeituras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  municipio text not null,
  uf char(2) not null,
  created_at timestamptz not null default now()
);

-- SECRETARIAS
create table public.secretarias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  prefeitura_id uuid not null references public.prefeituras(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- USUÁRIOS (perfil lógico; auth.users guarda credenciais)
create table public.usuarios (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique, -- referencia auth.users.id
  nome text not null,
  email text not null unique,
  tipo text not null check (tipo in ('municipal','consultor','admin')),
  cpf_hash text not null unique,             -- UNIQUE em hash
  cpf_last4 char(4) not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- VÍNCULO USUÁRIO MUNICIPAL → PREFEITURA/SECRETARIA
create table public.vinculos_usuarios (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  prefeitura_id uuid not null references public.prefeituras(id) on delete cascade,
  secretaria_id uuid references public.secretarias(id) on delete set null,
  cargo text not null check (cargo in ('prefeito','secretario','servidor')),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (usuario_id, ativo) -- garante 1 prefeitura ativa por usuário municipal
);
create index on public.vinculos_usuarios (usuario_id, prefeitura_id, ativo);

-- CONSULTOR ↔ PREFEITURAS (N:N)
create table public.consultores_prefeituras (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade, -- tipo=consultor
  prefeitura_id uuid not null references public.prefeituras(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (usuario_id, prefeitura_id)
);

-- (Opcional) Concessões adicionais de acesso entre secretarias
create table public.access_grants (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  prefeitura_id uuid not null references public.prefeituras(id) on delete cascade,
  secretaria_id uuid not null references public.secretarias(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (usuario_id, secretaria_id)
);

-- TAREFAS
create table public.tarefas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  responsavel_id uuid not null references public.usuarios(id) on delete restrict,
  prefeitura_id uuid not null references public.prefeituras(id) on delete cascade,
  secretaria_id uuid references public.secretarias(id) on delete set null,
  status text not null check (status in ('a_fazer','fazendo','feito')) default 'a_fazer',
  arquivada boolean not null default false,
  created_by uuid not null references public.usuarios(id) on delete set null,
  updated_by uuid references public.usuarios(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on public.tarefas (prefeitura_id, secretaria_id, status, arquivada);

-- OBSERVADORES DE TAREFA (N:N)
create table public.observadores_tarefa (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references public.tarefas(id) on delete cascade,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tarefa_id, usuario_id)
);

-- HISTÓRICO DE STATUS
create table public.historico_tarefas (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references public.tarefas(id) on delete cascade,
  de_status text check (de_status in ('a_fazer','fazendo','feito')),
  para_status text not null check (para_status in ('a_fazer','fazendo','feito')),
  alterado_por uuid not null references public.usuarios(id) on delete set null,
  created_at timestamptz not null default now()
);

-- (Opcional) LOG genérico
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.usuarios(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);
