# PRD — Farol CEIGEP

## 1) Visão Geral

**Produto:** Farol CEIGEP — plataforma para apoio contínuo a municípios, começando por:

* **Gestão de usuários/consultores** com **hierarquia por Prefeitura/Secretaria**.
* **Gerenciador de tarefas** com **Kanban** (A fazer / Fazendo / Feito) e **arquivamento**.

**Stack alvo:**

* Frontend: Next.js (App Router), TypeScript, Tailwind, shadcn/ui (ou equivalente), React Query/TanStack Query.
* Backend/BD: Supabase (Postgres + Auth + RLS + Storage + Edge Functions, se necessário).
* Deploy: Vercel (prod + preview).

**Princípios:** modularidade (módulos independentes), simplicidade, acessibilidade (WCAG), segurança (LGPD), rastreabilidade (auditoria).

---

## 2) Objetivos do MVP

1. **Cadastrar e autenticar** usuários (Admin CEIGEP, Usuário municipal, Consultor).
2. **Mapear a estrutura**: Prefeitura → Secretarias → Usuários vinculados.
3. **Regras de acesso:**

   * Prefeito vê tudo da sua Prefeitura.
   * Secretário vê apenas sua Secretaria (salvo concessões explícitas).
   * Usuário municipal **só pode estar em 1 Prefeitura por vez**.
   * Consultor pode atuar em **múltiplas Prefeituras** (acessa integralmente essas prefeituras).
4. **Tarefas/Kanban:** criar/editar/mover/arquivar; responsável único; observadores múltiplos.
5. **Auditoria básica:** carimbo de data/autor, histórico mínimo de status de tarefas.
6. **Identidade visual CEIGEP:** seguir brand kit (cores/tipos) e estilo institucional.

---

## 3) Fora do Escopo (por ora)

* Relatórios, agenda de videoconferências, biblioteca de casos, indicadores públicos, MIS/AC.
* Notificações por e-mail/push.
* Integrações externas.

---

## 4) Papéis, Personas e Hierarquia

* **Admin CEIGEP:** gerencia tudo (usuários, prefeituras, secretarias, vínculos, consultores).
* **Usuário municipal:**

  * **Prefeito(a):** visão total da Prefeitura.
  * **Secretário(a):** visão apenas da sua Secretaria (padrão).
  * **Servidor(a):** visão apenas da sua Secretaria (padrão).
* **Consultor CEIGEP:** pode ver/trabalhar em múltiplas Prefeituras vinculadas.
* **Observadores de tarefa:** qualquer usuário com acesso ao contexto da tarefa, sem ser o responsável.

---

## 5) Histórias de Usuário (MVP) + Critérios de Aceite

### 5.1 Autenticação e Perfis

**Como** usuário, **quero** criar conta/entrar, **para** acessar a plataforma.

* Aceite:

  * Cadastro exige **CPF** (formato válido) e e-mail verificado.
  * Login com e-mail/senha (Supabase Auth).
  * Admin pode converter tipo do usuário (municipal/consultor/admin).
  * Logout funcional.

### 5.2 Estrutura Organizacional

**Como** Admin, **quero** cadastrar Prefeitura e Secretarias, **para** organizar usuários.

* Aceite:

  * CRUD de Prefeituras/Secretarias.
  * Vínculo usuário municipal ↔ (Prefeitura, Secretaria opcional, Cargo).
  * **Apenas 1 vínculo ativo por usuário municipal** (garantido no BD).

### 5.3 Consultores

**Como** Admin, **quero** vincular consultores a prefeituras múltiplas, **para** atuação multi-contas.

* Aceite:

  * CRUD de vínculos consultor↔prefeitura (N:N).
  * Consultor alterna prefeitura ativa no painel.

### 5.4 Tarefas e Kanban

**Como** usuário autorizado, **quero** gerenciar tarefas, **para** organizar demandas.

* Aceite:

  * Campos: título, descrição, responsável único, observadores 0..n, prefeitura (obrigatório), secretaria (opcional), status {a_fazer|fazendo|feito}, arquivada bool.
  * Kanban com **drag&drop** e atualização de status.
  * **Arquivar** oculta do quadro; há tela/lista de arquivadas.
  * Histórico mínimo de transição de status (timestamp, quem alterou).

### 5.5 Permissões

**Como** Prefeito, **quero** ver tudo da minha prefeitura.
**Como** Secretário/Servidor, **quero** ver apenas minha secretaria (salvo concessão).
**Como** Consultor, **quero** ver todas as prefeituras vinculadas.

* Aceite:

  * RLS confirma escopos.
  * Admin tem acesso total.

---

## 6) Requisitos Funcionais (detalhados)

### 6.1 Identidade e LGPD (CPF)

* **CPF é identificador lógico único** do usuário (além do UUID).
* Armazenamento:

  * `cpf_hash` (SHA-256, **índice único**).
  * `cpf_last4` (para exibir).
  * **Nunca** exibir CPF completo.
* Base legal (MVP): execução de contrato/legítimo interesse (ajustar com jurídico CEIGEP).
* Direitos do titular: endpoint/processo interno para acesso/retificação/eliminação (quando aplicável).

### 6.2 Estrutura e Vínculos

* Prefeituras possuem n Secretarias.
* Usuário municipal tem **1 vínculo ativo** com prefeitura (secretaria opcional, cargo).
* Consultor ↔ Prefeitura (N:N).
* Concessões extras: lista branca opcional para um usuário acessar outra secretaria (tabela **access_grants**, MVP opcional).

### 6.3 Permissões (resumo)

* Admin: total.
* Prefeito: prefeitura = sua.
* Secretário/Servidor: prefeitura = sua **e** secretaria = sua (salvo concessão).
* Consultor: prefeitura ∈ {suas prefeituras vinculadas}.

### 6.4 Tarefas

* Responsável sempre 1 (ref usuário).
* Observadores N:N (sem poderes de edição especiais por si; dependem de RLS da tarefa).
* **Transições**: livre entre {a_fazer, fazendo, feito}.
* **Arquivar**: `arquivada=true`, fora do quadro principal.
* Log mínimo: tabela de transições (`historico_tarefas`).

### 6.5 Auditoria

* `created_at`, `updated_at`, `created_by`, `updated_by` em tabelas-chave.
* Histórico de status por tarefa.
* (Opcional) tabela `audit_log` para eventos relevantes (CRUD, mudanças de permissão).

---

## 7) Requisitos Não Funcionais

* **Segurança:** RLS estrita; princípios de menor privilégio; esconder CPF.
* **Acessibilidade:** WCAG AA, navegação por teclado, `aria-*`.
* **Performance:** listas paginadas, índices em colunas de filtro.
* **Disponibilidade:** Vercel + Supabase (SLA padrão).
* **Observabilidade:** logs de API, tracing básico (Vercel + Supabase).
* **i18n:** pt-BR primeiro; strings externalizadas.
* **Brand:** aplicar manual CEIGEP (cores/tipografia); tokens centralizados.

---

## 8) Modelo de Dados (Supabase / Postgres)

> Nomes em minúsculo com underscore; enums via CHECK; UUID como PK; timestamps.

### 8.1 Tabelas

```sql
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
```



## 9) RLS — Row-Level Security (policies essenciais)

> Ativar RLS em todas as tabelas públicas:

```sql
alter table public.prefeituras enable row level security;
alter table public.secretarias enable row level security;
alter table public.usuarios enable row level security;
alter table public.vinculos_usuarios enable row level security;
alter table public.consultores_prefeituras enable row level security;
alter table public.access_grants enable row level security;
alter table public.tarefas enable row level security;
alter table public.observadores_tarefa enable row level security;
alter table public.historico_tarefas enable row level security;
alter table public.audit_log enable row level security;
```

### 9.1 Helpers

Crie uma **view** para mapear `auth.uid()` → `usuarios.id`:

```sql
create or replace view public.current_usuario as
select u.*
from public.usuarios u
where u.auth_user_id = auth.uid();
```

### 9.2 Esboço de políticas (resumo conceitual)

* **Admin (tipo='admin')**: `USING (true)` e `WITH CHECK (true)` em todas as tabelas.
* **Prefeito (vínculo ativo cargo='prefeito')**: pode `SELECT/INSERT/UPDATE` quando `registro.prefeitura_id = prefeitura_do_vinculo`.
* **Secretário/Servidor**: igual ao acima, **e** (em tarefas) `secretaria_id is null OR secretaria_id = sua_secretaria OR existe access_grants`.
* **Consultor**: `prefeitura_id IN (select prefeitura_id from consultores_prefeituras where usuario_id = current_usuario.id)`.

> **Obs.:** Na prática, você escreverá 1–2 policies por operação/tabela, usando subqueries com `current_usuario`. Priorize primeiro `tarefas`, `vinculos_usuarios`, `consultores_prefeituras`.

---

## 10) API (Next.js Route Handlers ou Supabase client direto)

> Sempre preferir **RPC via Supabase** + RLS. Para operações que exijam lógica extra (hash/cripto do CPF), use **Edge Functions** ou **route handlers**.

### 10.1 Exemplos de endpoints (se optar por route handlers)

* `POST /api/users` — cria `auth.users` + `usuarios` (faz hash/cripto CPF).
* `POST /api/prefeituras` — admin only.
* `POST /api/secretarias` — admin/prefeito da prefeitura.
* `POST /api/vinculos` — admin/prefeito (gera vínculo único ativo; inativar anteriores).
* `POST /api/consultores/vincular` — admin vincula consultor a prefeitura.
* `GET /api/tarefas?prefeitura=...&secretaria=...&status=...&arquivada=...`
* `POST /api/tarefas` — cria tarefa (valida escopo).
* `PATCH /api/tarefas/:id` — atualiza campos + status (grava histórico).
* `POST /api/tarefas/:id/observadores` — add/remover.
* `POST /api/tarefas/:id/arquivar` / `.../desarquivar`.

### 10.2 Contratos (ex.)

```json
// POST /api/tarefas
{
  "titulo": "Implantar rotina de LAI",
  "descricao": "Publicar indicadores até dia 10",
  "responsavelId": "<uuid>",
  "prefeituraId": "<uuid>",
  "secretariaId": "<uuid|null>"
}
```

Resposta: 201 com o objeto tarefa; 403 se fora do escopo RLS.

---

## 11) UX / UI

### 11.1 Navegação principal

* **/login** — autenticação e cadastro (CPF obrigatório no cadastro).
* **/admin** — gerenciar prefeituras, secretarias, usuários, vínculos, consultores.
* **/painel** (usuário municipal) — visão geral da prefeitura/secretaria, contadores, acesso ao Kanban.
* **/consultor** — seletor de prefeitura ativa + visão do painel/kanban da prefeitura escolhida.
* **/tarefas** — Kanban (3 colunas, drag&drop, filtros).
* **/arquivadas** — lista filtrável (desarquivar).

### 11.2 Componentes-chave

* Header com identidade CEIGEP (usar brand kit).
* Cards de resumo (tarefas por status).
* **KanbanColumn**, **KanbanCard**, **TaskDialog**, **UserPicker**, **PrefeituraSelector**, **SecretariaBadge**.
* Estados: loading, empty (mensagens claras), error (com retry).

### 11.3 Design/Brand

* Aplicar cores/tipografia do **brand kit CEIGEP** (tokens globais).
* Tipografia: Raleway (via Google Fonts).
* Acessibilidade: foco visível, labels, erros com texto, aria-live.

---

## 12) Segurança e LGPD

* **Dados pessoais sensíveis:** CPF com hash único.
* **Minimização:** exibir apenas `cpf_last4`.
* **Base legal** a validar (execução de contrato/legítimo interesse).
* **Política de privacidade** e **termos de uso** (links rodapé).
* **Direitos do titular:** contato/fluxo para acesso/retificação/exclusão quando cabível.
* **Logs de acesso a dados pessoais** (audit_log básico).

---

## 13) Deploy e Ambientes

* **Vercel**:

  * Envs: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (apenas server), `APP_ENCRYPTION_KEY` (PGP), etc.
  * Preview deployments em PRs.
* **Supabase**:

  * Projeto com **RLS habilitado** e policies aplicadas.
  * Rodar **migrations** (SQL acima).
  * Buckets de Storage (futuro: anexos de tarefas).
* **Domínio e SSL** via Vercel.

---

## 14) Variáveis de Ambiente (sugestão)

* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY` (server only)
* `APP_NODE_ENV`
* (futuro) SMTP se notificar

---

## 15) Plano de Testes

### 15.1 Unidade/Integração (frontend)

* Form de cadastro (validação CPF), login/logout.
* Guardas de rota por papel.
* Kanban: drag&drop altera status e cria histórico.
* Filtros de tarefas; paginação.

### 15.2 Integração/BD

* **RLS:**

  * Secretário não vê outra secretaria (sem grant).
  * Prefeito vê tudo da prefeitura.
  * Consultor vê apenas prefeituras vinculadas.
  * Admin vê tudo.
* **Vínculo único ativo**: tentar criar 2 vínculos ativos → falha.

### 15.3 Segurança/LGPD

* CPF nunca retornado inteiro.
* `cpf_hash` único.
* Tentativas de acesso cruzado → 403.

---

## 16) Roadmap (pós-MVP)

* Comentários em tarefas, anexos (Storage), tags e vencimentos.
* Notificações (e-mail/webpush).
* Relatórios e indicadores.
* Agenda de consultorias (slots).
* Portal público de resultados (transparência).
* RBAC refinado por permissão granular.

---

## 17) Aceite do MVP (Checklist)

* [ ] Autenticação Supabase com CPF obrigatório no cadastro.
* [ ] Estrutura Prefeitura/Secretaria operacional.
* [ ] Usuário municipal com **1 vínculo ativo** garantido pela base.
* [ ] Consultor vinculado a múltiplas prefeituras, com troca de contexto.
* [ ] Kanban funcional (A fazer / Fazendo / Feito), drag&drop e **arquivar**.
* [ ] RLS aplicada e auditada nos principais cenários.
* [ ] Auditoria mínima (histórico de status).
* [ ] UI com identidade CEIGEP, acessível e responsiva.
* [ ] Deploy em Vercel + Supabase, com envs e migrations.

---

## 18) Anexos Úteis (resumo técnico)

### 18.1 Migrations (ordem sugerida)

1. extensões
2. prefeituras, secretarias
3. usuarios
4. vinculos_usuarios + índice parcial (unique ativo)
5. consultores_prefeituras
6. access_grants (opcional)
7. tarefas, observadores_tarefa, historico_tarefas, audit_log
8. views/helpers (current_usuario)
9. RLS + policies

### 18.2 Esqueleto de Policy (exemplo em tarefas)

```sql
-- Exemplo: SELECT em tarefas (municipal - secretário/servidor)
create policy tarefas_select_municipal
on public.tarefas
for select
to authenticated
using (
  exists (
    select 1
    from current_usuario cu
    join vinculos_usuarios vu on vu.usuario_id = cu.id and vu.ativo = true
    where
      -- admin bypass (se preferir em policy separada):
      (cu.tipo = 'admin')
      or (
        tarefas.prefeitura_id = vu.prefeitura_id
        and (
          tarefas.secretaria_id is null
          or tarefas.secretaria_id = vu.secretaria_id
          or exists (
            select 1 from access_grants ag
            where ag.usuario_id = cu.id
              and ag.secretaria_id = tarefas.secretaria_id
          )
        )
      )
  )
);
```

> Replicar variações para UPDATE/INSERT (com `WITH CHECK`) e para perfis de **prefeito** e **consultor** (substituindo a regra do escopo).

---

### 18.3 UI — Estrutura de pastas (Next.js App Router)

```
/app
  /login
  /admin
  /painel
  /consultor
  /tarefas
  /arquivadas
/components
  KanbanColumn.tsx
  KanbanCard.tsx
  TaskDialog.tsx
  UserPicker.tsx
  PrefeituraSelector.tsx
  ...
/lib
  supabaseClient.ts
  auth.ts (guards, getCurrentUsuario)
  rls-helpers.ts
/styles
  globals.css (tokens brand)
/server (se usar route handlers/edge functions)
```

---

# Guia de Design da Aplicação (CEIGEP Brand Kit)

## Fundamentos de marca

* **Princípio orientador:** simplicidade, precisão e consciência — traduza isso em interface limpa, poucos elementos na tela e foco no essencial. 
* **Paleta oficial (hex):**

  * Cinza-escuro **#2A2B2D** (conteúdo primário, títulos, ícones “on dark”)
  * Cinza **#4E555E** (texto primário em fundo claro)
  * Cinza-médio **#80858B** (texto secundário/legendas)
  * Bege 1 **#D1BAA6** e Bege 2 **#B9ADA2** (acentos discretos/realces)
  * Azul-claro **#CDD6DF** (feedback informativo/superfícies suaves)
    A paleta comunica estabilidade (cinzas), humanidade (beges) e transparência/serenidade (azul-claro).  
* **Tipografia:** **Raleway** (Regular/Bold/Light). Traço limpo e minimalista para clareza e seriedade. Use Raleway Regular para textos, Bold para títulos/ênfases, Light com parcimônia em displays. 
* **Imagens:** simples, autênticas e humanas; tons claros, composições limpas, foco em pessoas; evite poluição visual. 

---

## Mobile-first primeiro

* **Breakpoints sugeridos:**

  * base: 0–639px, **sm: 640** | **md: 768** | **lg: 1024** | **xl: 1280**.
    Comece desenhando para base; só adicione colunas/complexidade nos próximos degraus.
* **Layout base no mobile:** barra superior fixa (título curto + ação principal), conteúdo em **uma coluna**, navegação por **tabs** ou **drawer**; evite barras inferiores lotadas.
* **Gestos:** swipe para fechar modais/drawers; drag-and-drop apenas no Kanban (com zonas de drop grandes).

---

## Sistema de design (tokens + regras)

### Cores (tokens)

```css
:root{
  --fg-strong:#2A2B2D;   /* títulos/ícones */
  --fg:#4E555E;          /* texto principal */
  --fg-muted:#80858B;    /* secundário/legendas */
  --bg:#FFFFFF;          /* fundo */
  --surface:#F7F8F9;     /* cards/listas sutis */
  --accent-1:#D1BAA6;    /* acento suave */
  --accent-2:#B9ADA2;    /* acento alternativo */
  --info:#CDD6DF;        /* info/empties */
  --border:#E6E8EA;      /* linhas divisórias */
}
```

**Uso recomendado:**

* Texto primário: `--fg` sobre `--bg`.
* Títulos/ícones fortes: `--fg-strong`.
* Borda 1px sólida com `--border` (linhas discretas).
* **Evite** usar beges como fundo de página; prefira para chips, badges, barras de progresso sutis.

### Tipografia (escala responsiva)

* **Raleway** (system fallback sans-serif). 
* **Escala (mobile → desktop):**

  * h1: 22/28 → 28/34, **700**
  * h2: 18/24 → 22/28, **700**
  * h3: 16/22 → 18/24, **600/700**
  * body: 15/22 → 16/24, **400**
  * caption: 13/18 → 14/20, **400**
* **Regras:** máximo de **dois pesos** por tela (ex.: 400/700). Evite ALL CAPS extensivo; prefira **Bold + tracking ligeiro** para seções.

### Grid, espaçamento e densidade

* **Grid de 8px** (multiplicadores: 4/8/12/16/24/32).
* **Containers:** 16px padding lateral no mobile; 24–32px no desktop.
* **Alturas de alvo:** toque mínimo **44px** (botões, listas).
* **Densidade:** priorize respiro; até 8 itens acima da dobra no mobile.

### Ícones e ilustrações

* Ícones lineares (ex.: 24px, stroke 1.5–2px), cor = `--fg-muted` em repouso; `--fg-strong` em foco/ativo.
* Ilustrações minimalistas com tons da paleta (cinzas/azul-claro) e toque de bege; **nada de saturação alta**. 

### Elevações, raios e motion

* **Raios:** 10–12px (cards, modais).
* **Sombras** suaves (1–3 níveis):

  * s1: 0 1px 2px rgba(0,0,0,.04)
  * s2: 0 2px 8px rgba(0,0,0,.06)
  * s3: 0 8px 24px rgba(0,0,0,.08)
* **Animações:** 120–180ms, easing suave; **1 propósito por vez** (entradas/expansões). Sem bounce.

---

## Componentes (padrões de UI)

### App Bar

* Altura 56–64px (mobile), fundo `--bg`, título curto (máx. 24 caracteres), ação primária à direita.
* Divider inferior 1px `--border` quando houver scroll.

### Navegação

* **Mobile:** tabs no topo ou lateral via drawer; **evite** 5+ itens.
* **Desktop:** sidebar fixa 240px + área de conteúdo fluida.

### Cards e listas

* **Card:** padding 16–20px; título (h3), metadados (fg-muted), ações à direita.
* **Lista:** linhas 56–64px; **um** ícone à esquerda; texto de apoio de **uma** linha.

### Botões

* **Primário:** fundo `--fg-strong`, texto branco; radius 10px; min-width 96px; altura 44–48px.
* **Secundário:** borda `--fg-strong` 1px, texto `--fg-strong`, fundo `transparent`.
* **Terciário/Link:** texto `--fg-strong` sem borda.
* Estados (hover/focus/disabled) sempre com contraste claro (WCAG AA).

### Formulários

* Campos altura 44px; label sempre visível; help text opcional (fg-muted).
* Erro em vermelho neutro derivado de `--fg-strong` com **texto claro e curto**.
* Máscaras de CPF, telefone e CNPJ (onde couber).

### Tarefas & Kanban

* **Colunas:** “A fazer”, “Fazendo”, “Feito” — largura fluida; no mobile, **carrossel horizontal** (1 coluna por vez) + drag-and-drop.
* **Card de tarefa:**

  * Título (máx. 2 linhas, **Bold**), descrição (1 linha), responsável (avatar + nome curto), badges (secretaria/prefeitura).
  * Cores de status **não intrusivas**: use `--info` como base de “indicadores” leves; evite semáforos saturados. 

### Tabelas (quando necessárias)

* Só em **md+**; no mobile, **listas**.
* Colunas essenciais, zebra sutil (`--surface`), header 12–14/700.

### Vazios (empty states)

* Ícone grande em `--info`, 1 frase objetiva e 1 CTA.
* **Nada de parágrafos longos.**

---

## Acessibilidade & conteúdo

* **Contraste:** texto principal ≥ 4.5:1; textos sobre bege devem usar `--fg-strong`.
* **Foco visível** (outline 2px) e navegação por teclado estável.
* **Linguagem:** direta e cidadã; evite jargão. (A estética minimalista reforça clareza e proximidade.) 

---

## Exemplo de “baseline” (Tailwind)

```js
// tailwind.config.js (trecho)
theme:{
  extend:{
    colors:{
      fg:{ DEFAULT:'#4E555E', strong:'#2A2B2D', muted:'#80858B'},
      accent:{ 1:'#D1BAA6', 2:'#B9ADA2'},
      info:'#CDD6DF',
      border:'#E6E8EA',
      surface:'#F7F8F9',
    },
    borderRadius:{ md:'10px', lg:'12px' },
    boxShadow:{
      s1:'0 1px 2px rgba(0,0,0,.04)',
      s2:'0 2px 8px rgba(0,0,0,.06)',
      s3:'0 8px 24px rgba(0,0,0,.08)'
    },
    fontFamily:{ sans:['Raleway','ui-sans-serif','system-ui'] }
  }
}
```

---

## Do / Don’t (resumo rápido)

**Faça:** poucas cores na mesma tela; 1–2 pesos tipográficos; grid 8px; respiro generoso; ícones discretos.
**Evite:** fundos coloridos extensos; sombras pesadas; textos longos em componentes; três ou mais pesos tipográficos; “arco-íris” de status.

---

## Checklist de implementação de UI

* [ ] Paleta e tipografia do Brand Kit aplicadas.  
* [ ] Mobile-first pronto (uma coluna, toques ≥ 44px).
* [ ] Contraste e foco AA.
* [ ] Kanban usável no mobile (scroll horizontal + DnD).
* [ ] Empty states com `--info` e CTA claro.
* [ ] Imagens/ilustrações minimalistas e humanas, quando usadas.