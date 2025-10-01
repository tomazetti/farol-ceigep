-- Cria uma função que retorna todos os perfis de usuário vinculados a uma prefeitura específica.
-- SECURITY DEFINER permite que a função ignore a RLS da tabela 'usuarios' para fazer o JOIN.
CREATE OR REPLACE FUNCTION public.get_colleagues_in_prefeitura(p_prefeitura_id UUID)
RETURNS SETOF public.usuarios
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.*
  FROM public.usuarios u
  JOIN public.vinculos_usuarios v ON u.id = v.usuario_id
  WHERE v.prefeitura_id = p_prefeitura_id AND v.ativo = true;
$$;

-- Concede permissão para que usuários logados executem esta função.
GRANT EXECUTE ON FUNCTION public.get_colleagues_in_prefeitura(UUID) TO authenticated;
