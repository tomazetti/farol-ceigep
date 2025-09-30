-- Habilita a extensão PostGIS se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS postgis;

-- Adiciona as novas colunas à tabela de municípios
ALTER TABLE public.municipios
ADD COLUMN IF NOT EXISTS codigo_tse INTEGER,
ADD COLUMN IF NOT EXISTS codigo_receita_federal INTEGER,
ADD COLUMN IF NOT EXISTS codigo_bcb INTEGER,
ADD COLUMN IF NOT EXISTS capital BOOLEAN,
ADD COLUMN IF NOT EXISTS microrregiao_id INTEGER,
ADD COLUMN IF NOT EXISTS microrregiao_nome TEXT,
ADD COLUMN IF NOT EXISTS mesorregiao_id INTEGER,
ADD COLUMN IF NOT EXISTS mesorregiao_nome TEXT,
ADD COLUMN IF NOT EXISTS regiao_metropolitana_id TEXT,
ADD COLUMN IF NOT EXISTS regiao_metropolitana_nome TEXT,
ADD COLUMN IF NOT EXISTS ddd TEXT,
ADD COLUMN IF NOT EXISTS uf_sigla CHAR(2),
ADD COLUMN IF NOT EXISTS regiao_nome TEXT,
ADD COLUMN IF NOT EXISTS centroide GEOGRAPHY(POINT, 4326);
