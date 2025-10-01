-- Corrige a função get_task_details para remover a referência ambígua da coluna 'id'.
CREATE OR REPLACE FUNCTION public.get_task_details(p_task_id UUID)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  descricao TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  responsavel JSON,
  criador JSON,
  observadores JSON,
  historico JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifica se o usuário tem permissão para ver esta tarefa
  IF EXISTS (
    -- Correção: Adiciona um alias 'permitted_tasks' e usa 'permitted_tasks.id'
    SELECT 1
    FROM public.get_tasks_for_user(
      (SELECT prefeitura_id FROM public.tarefas WHERE id = p_task_id)
    ) AS permitted_tasks
    WHERE permitted_tasks.id = p_task_id
  ) THEN
    -- Se tiver permissão, retorna os dados completos
    RETURN QUERY
    SELECT
      t.id,
      t.titulo,
      t.descricao,
      t.status,
      t.created_at,
      json_build_object('id', r.id, 'nome', r.nome) AS responsavel,
      json_build_object('id', c.id, 'nome', c.nome) AS criador,
      (
        SELECT json_agg(json_build_object('usuario', json_build_object('id', u.id, 'nome', u.nome)))
        FROM public.observadores_tarefa ot
        JOIN public.usuarios u ON ot.usuario_id = u.id
        WHERE ot.tarefa_id = t.id
      ) AS observadores,
      (
        SELECT json_agg(
          json_build_object(
            'id', ht.id,
            'de_status', ht.de_status,
            'para_status', ht.para_status,
            'created_at', ht.created_at,
            'alterado_por_usuario', json_build_object('id', apu.id, 'nome', apu.nome)
          )
        )
        FROM public.historico_tarefas ht
        JOIN public.usuarios apu ON ht.alterado_por = apu.id
        WHERE ht.tarefa_id = t.id
      ) AS historico
    FROM
      public.tarefas t
      LEFT JOIN public.usuarios r ON t.responsavel_id = r.id
      LEFT JOIN public.usuarios c ON t.created_by = c.id
    WHERE
      t.id = p_task_id;
  END IF;
END;
$$;
