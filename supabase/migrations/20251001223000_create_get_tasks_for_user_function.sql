CREATE OR REPLACE FUNCTION public.get_tasks_for_user(p_prefeitura_id UUID)
RETURNS SETOF public.tarefas
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.tarefas
  WHERE
    prefeitura_id = p_prefeitura_id
    AND arquivada = false
    AND (
      -- O usuário é admin
      is_admin()
      OR
      -- O usuário é o criador
      created_by = (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())
      OR
      -- O usuário é o responsável
      responsavel_id = (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())
      OR
      -- O usuário é um observador
      id IN (
        SELECT tarefa_id FROM public.observadores_tarefa
        WHERE usuario_id = (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())
      )
    );
$$;
