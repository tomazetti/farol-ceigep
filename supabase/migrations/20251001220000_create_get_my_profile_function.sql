-- Cria uma função que busca o perfil do usuário logado.
-- SECURITY DEFINER faz com que a função execute com os privilégios do criador (postgres),
-- ignorando a RLS da tabela 'usuarios' apenas para esta consulta específica.
-- Isso garante que a busca do próprio perfil no login NUNCA falhe por causa da RLS.
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.usuarios
LANGUAGE sql
SECURITY DEFINER
-- Define o search_path para evitar que a função seja sequestrada por um usuário mal-intencionado.
SET search_path = public
AS $$
  SELECT *
  FROM public.usuarios
  WHERE auth_user_id = auth.uid();
$$;
