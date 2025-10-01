-- 1. Limpeza: Remove a função anterior para garantir uma substituição limpa.
DROP FUNCTION IF EXISTS public.get_tasks_for_user(UUID, TEXT, UUID);

-- 2. Recriação: Recria a função com a lógica para lidar com "Tarefas CEIGEP" (prefeitura_id IS NULL).
CREATE OR REPLACE FUNCTION public.get_tasks_for_user(
  p_prefeitura_id UUID,
  p_filter_type TEXT DEFAULT 'all',
  p_orgao_id UUID DEFAULT NULL
)
RETURNS SETOF public.tarefas
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.tarefas t
  WHERE
    -- Condição principal: ou a prefeitura corresponde, ou estamos buscando tarefas sem prefeitura.
    (t.prefeitura_id = p_prefeitura_id OR (p_prefeitura_id IS NULL AND t.prefeitura_id IS NULL))
    AND t.arquivada = false
    AND (
      (p_filter_type = 'mine' AND t.responsavel_id = public.get_my_user_id())
      OR
      (p_orgao_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.vinculos_usuarios vu
        WHERE vu.usuario_id = t.responsavel_id AND vu.orgao_id = p_orgao_id AND vu.ativo = true
      ))
      OR
      (p_filter_type = 'all' AND p_orgao_id IS NULL)
    )
    AND (
      is_admin()
      OR
      -- Para tarefas sem prefeitura (CEIGEP), a visibilidade é restrita ao criador, responsável ou observador.
      (t.prefeitura_id IS NULL AND (
        t.created_by = public.get_my_user_id() OR
        t.responsavel_id = public.get_my_user_id() OR
        t.id IN (SELECT tarefa_id FROM public.observadores_tarefa WHERE usuario_id = public.get_my_user_id())
      ))
      OR
      -- Para tarefas com prefeitura, a lógica anterior se aplica.
      (t.prefeitura_id IS NOT NULL AND (
        t.created_by = public.get_my_user_id() OR
        t.responsavel_id = public.get_my_user_id() OR
        t.id IN (SELECT tarefa_id FROM public.observadores_tarefa WHERE usuario_id = public.get_my_user_id()) OR
        t.orgao_id IN (SELECT * FROM public.get_my_managed_orgao_ids())
      ))
    );
$$;

-- Garante que a permissão de execução seja mantida.
GRANT EXECUTE ON FUNCTION public.get_tasks_for_user(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tasks_for_user(UUID, TEXT, UUID) TO postgres;
