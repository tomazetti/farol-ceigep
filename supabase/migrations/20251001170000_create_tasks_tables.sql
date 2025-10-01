-- Garante que as tabelas sejam removidas antes de serem criadas para evitar conflitos.
-- O CASCADE remove objetos dependentes (como índices e chaves estrangeiras).
DROP TABLE IF EXISTS public.historico_tarefas CASCADE;
DROP TABLE IF EXISTS public.observadores_tarefa CASCADE;
DROP TABLE IF EXISTS public.tarefas CASCADE;

-- TAREFAS
CREATE TABLE public.tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  responsavel_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
  prefeitura_id UUID NOT NULL REFERENCES public.prefeituras(id) ON DELETE CASCADE,
  orgao_id UUID REFERENCES public.orgaos(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('a_fazer', 'fazendo', 'feito')) DEFAULT 'a_fazer',
  arquivada BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);
CREATE INDEX ON public.tarefas (prefeitura_id, orgao_id, status, arquivada);

-- OBSERVADORES DE TAREFA (N:N)
CREATE TABLE public.observadores_tarefa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tarefa_id, usuario_id)
);

-- HISTÓRICO DE STATUS
CREATE TABLE public.historico_tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
  de_status TEXT CHECK (de_status IN ('a_fazer', 'fazendo', 'feito')),
  para_status TEXT NOT NULL CHECK (para_status IN ('a_fazer', 'fazendo', 'feito')),
  alterado_por UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
