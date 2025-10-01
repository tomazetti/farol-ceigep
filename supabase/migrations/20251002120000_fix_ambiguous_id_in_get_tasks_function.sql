-- Atualiza a função de busca de tarefas para corrigir a referência ambígua da coluna 'id'.
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
      is_admin()
      OR
      created_by = public.get_my_user_id()
      OR
      responsavel_id = public.get_my_user_id()
      OR
      -- Correção: Qualifica explicitamente 'id' como 'public.tarefas.id' para remover a ambiguidade.
      public.tarefas.id IN (
        SELECT tarefa_id FROM public.observadores_tarefa
        WHERE usuario_id = public.get_my_user_id()
      )
      OR
      orgao_id IN (SELECT * FROM public.get_my_managed_orgao_ids())
    );
$$;
