-- Cria uma função auxiliar que retorna o ID do perfil (da tabela public.usuarios) do usuário logado.
-- SECURITY DEFINER garante que a função execute com privilégios elevados,
-- ignorando a RLS da tabela 'usuarios' e evitando recursão.
CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.usuarios
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- Concede permissão para que usuários logados executem esta função.
GRANT EXECUTE ON FUNCTION public.get_my_user_id() TO authenticated;
