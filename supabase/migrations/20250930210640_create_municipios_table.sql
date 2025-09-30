CREATE TABLE public.municipios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_ibge INTEGER NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  uf_id INTEGER NOT NULL,
  uf_nome TEXT NOT NULL,
  regiao_intermediaria_id INTEGER,
  regiao_intermediaria_nome TEXT,
  regiao_imediata_id INTEGER,
  regiao_imediata_nome TEXT
);

CREATE INDEX idx_municipios_codigo_ibge ON public.municipios(codigo_ibge);
CREATE INDEX idx_municipios_uf_id ON public.municipios(uf_id);
