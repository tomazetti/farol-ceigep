-- Cria uma função que retorna o ID do órgão do usuário logado e os IDs de todos os órgãos subordinados a ele, recursivamente.
CREATE OR REPLACE FUNCTION public.get_my_managed_orgao_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
-- Define o search_path para segurança, evitando hijacking.
SET search_path = public
AS $$
  WITH RECURSIVE subordinate_orgaos AS (
    -- Ponto de partida (âncora): O órgão direto do usuário logado.
    SELECT o.id
    FROM public.orgaos o
    JOIN public.vinculos_usuarios vu ON o.id = vu.orgao_id
    WHERE vu.usuario_id = public.get_my_user_id() AND vu.ativo = true AND vu.orgao_id IS NOT NULL

    UNION ALL

    -- Passo recursivo: Encontra os órgãos cujo 'orgao_superior_id'
    -- corresponde a um ID que já encontramos na iteração anterior.
    SELECT o.id
    FROM public.orgaos o
    JOIN subordinate_orgaos so ON o.orgao_superior_id = so.id
  )
  SELECT id FROM subordinate_orgaos;
$$;

-- Concede permissão para que usuários logados executem esta função.
GRANT EXECUTE ON FUNCTION public.get_my_managed_orgao_ids() TO authenticated;
