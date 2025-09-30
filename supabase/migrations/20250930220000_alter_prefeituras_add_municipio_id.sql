-- Remove as colunas antigas 'municipio' e 'uf'
ALTER TABLE public.prefeituras
DROP COLUMN IF EXISTS municipio,
DROP COLUMN IF EXISTS uf;

-- Adiciona a nova coluna 'municipio_id' com a chave estrangeira
ALTER TABLE public.prefeituras
ADD COLUMN IF NOT EXISTS municipio_id UUID REFERENCES public.municipios(id) ON DELETE RESTRICT;

-- Adiciona um índice na nova coluna para otimizar as consultas
CREATE INDEX IF NOT EXISTS idx_prefeituras_municipio_id ON public.prefeituras(municipio_id);

-- Garante que cada município só possa ter uma prefeitura
ALTER TABLE public.prefeituras
ADD CONSTRAINT unique_municipio_id UNIQUE (municipio_id);
