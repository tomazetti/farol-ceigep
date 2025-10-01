-- Corrige a função get_task_details, tornando a verificação de permissão auto-contida para eliminar a ambiguidade.
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
DECLARE
  v_has_permission BOOLEAN;
BEGIN
  -- Verificação de permissão auto-contida para evitar chamadas aninhadas e ambiguidade.
  SELECT EXISTS (
    SELECT 1
    FROM public.tarefas t
    WHERE t.id = p_task_id
    AND (
      is_admin() OR
      t.created_by = public.get_my_user_id() OR
      t.responsavel_id = public.get_my_user_id() OR
      t.id IN (SELECT ot.tarefa_id FROM public.observadores_tarefa ot WHERE ot.usuario_id = public.get_my_user_id()) OR
      t.orgao_id IN (SELECT * FROM public.get_my_managed_orgao_ids())
    )
  ) INTO v_has_permission;

  IF v_has_permission THEN
    -- Se o usuário tiver permissão, retorna os dados completos da tarefa.
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
