-- Cria uma função que retorna o ID e o Nome do órgão do usuário logado e de todos os seus subordinados.
CREATE OR REPLACE FUNCTION public.get_my_filterable_orgaos()
RETURNS TABLE (
  id UUID,
  nome TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE subordinate_orgaos AS (
    -- Ponto de partida: O órgão direto do usuário logado.
    SELECT o.id, o.nome
    FROM public.orgaos o
    JOIN public.vinculos_usuarios vu ON o.id = vu.orgao_id
    WHERE vu.usuario_id = public.get_my_user_id() AND vu.ativo = true AND vu.orgao_id IS NOT NULL

    UNION ALL

    -- Passo recursivo: Encontra os órgãos subordinados.
    SELECT o.id, o.nome
    FROM public.orgaos o
    JOIN subordinate_orgaos so ON o.orgao_superior_id = so.id
  )
  SELECT id, nome FROM subordinate_orgaos;
$$;

-- Concede permissão para que usuários logados e o postgres role executem esta função.
GRANT EXECUTE ON FUNCTION public.get_my_filterable_orgaos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_filterable_orgaos() TO postgres;
