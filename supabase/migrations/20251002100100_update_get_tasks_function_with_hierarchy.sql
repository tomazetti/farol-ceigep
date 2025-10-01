-- Atualiza a função de busca de tarefas para incluir a lógica de hierarquia de órgãos.
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
      -- Regra 1: O usuário é admin (vê tudo).
      is_admin()
      OR
      -- Regra 2: O usuário é o criador da tarefa.
      created_by = public.get_my_user_id()
      OR
      -- Regra 3: O usuário é o responsável pela tarefa.
      responsavel_id = public.get_my_user_id()
      OR
      -- Regra 4: O usuário é um observador da tarefa.
      id IN (
        SELECT tarefa_id FROM public.observadores_tarefa
        WHERE usuario_id = public.get_my_user_id()
      )
      OR
      -- Regra 5 (NOVA): A tarefa pertence ao órgão do usuário ou a um órgão subordinado.
      orgao_id IN (SELECT * FROM public.get_my_managed_orgao_ids())
    );
$$;
