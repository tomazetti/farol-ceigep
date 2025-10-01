-- Garante que as tabelas sejam removidas antes de serem criadas para evitar conflitos.
DROP TABLE IF EXISTS public.consultores_prefeituras CASCADE;
DROP TABLE IF EXISTS public.consultores CASCADE;

-- 1. Cria a tabela de Consultores
CREATE TABLE public.consultores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  usuario_id UUID UNIQUE REFERENCES public.usuarios(id) ON DELETE SET NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.consultores (usuario_id);

-- 2. Cria a tabela de associação (N:N) entre Consultores e Prefeituras
CREATE TABLE public.consultores_prefeituras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultor_id UUID NOT NULL REFERENCES public.consultores(id) ON DELETE CASCADE,
  prefeitura_id UUID NOT NULL REFERENCES public.prefeituras(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (consultor_id, prefeitura_id)
);
CREATE INDEX ON public.consultores_prefeituras (consultor_id);
CREATE INDEX ON public.consultores_prefeituras (prefeitura_id);
