-- Cria uma função que retorna uma lista de usuários aos quais o usuário logado pode atribuir tarefas.
-- A lógica varia de acordo com o tipo do usuário logado (municipal, consultor, admin).
CREATE OR REPLACE FUNCTION public.get_assignable_users()
RETURNS TABLE (
  id UUID,
  nome TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type TEXT;
  v_user_id UUID;
BEGIN
  -- Obtém o tipo e o ID do usuário logado de forma segura
  SELECT u.id, u.tipo INTO v_user_id, v_user_type
  FROM public.usuarios u
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;

  -- Se o usuário for ADMIN, retorna todos os usuários ativos.
  IF v_user_type = 'admin' THEN
    RETURN QUERY
    SELECT u.id, u.nome FROM public.usuarios u WHERE u.ativo = true ORDER BY u.nome;

  -- Se o usuário for MUNICIPAL, retorna todos os usuários da mesma prefeitura.
  ELSIF v_user_type = 'municipal' THEN
    RETURN QUERY
    SELECT u.id, u.nome
    FROM public.usuarios u
    JOIN public.vinculos_usuarios vu ON u.id = vu.usuario_id
    WHERE vu.ativo = true
      AND vu.prefeitura_id = (
        SELECT v.prefeitura_id FROM public.vinculos_usuarios v
        WHERE v.usuario_id = v_user_id AND v.ativo = true
      )
    ORDER BY u.nome;

  -- Se o usuário for CONSULTOR, retorna outros consultores E usuários das prefeituras vinculadas.
  ELSIF v_user_type = 'consultor' THEN
    RETURN QUERY
    (
      -- 1. Todos os outros consultores ativos
      SELECT u.id, u.nome
      FROM public.usuarios u
      WHERE u.tipo = 'consultor' AND u.ativo = true
    )
    UNION
    (
      -- 2. Todos os usuários municipais das prefeituras vinculadas ao consultor
      SELECT u.id, u.nome
      FROM public.usuarios u
      JOIN public.vinculos_usuarios vu ON u.id = vu.usuario_id
      WHERE vu.ativo = true
        AND vu.prefeitura_id IN (
          SELECT cp.prefeitura_id
          FROM public.consultores_prefeituras cp
          JOIN public.consultores c ON cp.consultor_id = c.id
          WHERE c.usuario_id = v_user_id
        )
    )
    ORDER BY nome;
  END IF;
END;
$$;

-- Concede permissão para que usuários logados e o postgres role executem esta função.
GRANT EXECUTE ON FUNCTION public.get_assignable_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_assignable_users() TO postgres;
