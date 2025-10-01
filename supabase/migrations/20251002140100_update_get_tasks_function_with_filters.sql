-- Atualiza a função de busca de tarefas para aceitar parâmetros de filtro.
CREATE OR REPLACE FUNCTION public.get_tasks_for_user(
  p_prefeitura_id UUID,
  p_filter_type TEXT DEFAULT 'all', -- 'all' ou 'mine'
  p_orgao_id UUID DEFAULT NULL
)
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
    -- Aplica o filtro de órgão, se fornecido
    AND (p_orgao_id IS NULL OR orgao_id = p_orgao_id)
    -- Aplica o filtro 'minhas tarefas', se fornecido
    AND (p_filter_type <> 'mine' OR responsavel_id = public.get_my_user_id())
    -- Mantém a lógica de permissão de visualização
    AND (
      is_admin()
      OR
      created_by = public.get_my_user_id()
      OR
      responsavel_id = public.get_my_user_id()
      OR
      public.tarefas.id IN (
        SELECT tarefa_id FROM public.observadores_tarefa
        WHERE usuario_id = public.get_my_user_id()
      )
      OR
      orgao_id IN (SELECT * FROM public.get_my_managed_orgao_ids())
    );
$$;
