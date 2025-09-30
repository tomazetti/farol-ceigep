-- Atualiza a tabela principal com os dados da tabela temporária
UPDATE public.municipios m
SET
    codigo_tse = t.codigo_tse::INTEGER,
    codigo_receita_federal = t.codigo_receita_federal::INTEGER,
    codigo_bcb = t.codigo_bcb::INTEGER,
    capital = (t.capital = '1'),
    microrregiao_id = t.microrregiao_id::INTEGER,
    microrregiao_nome = t.microrregiao_nome,
    mesorregiao_id = t.mesorregiao_id::INTEGER,
    mesorregiao_nome = t.mesorregiao_nome,
    regiao_metropolitana_id = t.regiao_metropolitana_id,
    regiao_metropolitana_nome = t.regiao_metropolitana_nome,
    ddd = t.ddd,
    uf_sigla = t.uf_sigla,
    regiao_nome = t.regiao_nome,
    -- Converte o formato 'POINT(-63.32 -8.88)' para um tipo GEOGRAPHY
    centroide = ST_GeomFromText(REPLACE(REPLACE(t.centroide, 'POINT(', 'POINT('), ')', ')'), 4326)
FROM public.municipios_temp_import t
WHERE m.codigo_ibge = t.codigo_ibge::INTEGER;

-- Remove a tabela temporária após a conclusão do update
DROP TABLE public.municipios_temp_import;
