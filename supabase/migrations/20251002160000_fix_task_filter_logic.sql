-- 1. Limpeza: Remove a função anterior para garantir uma substituição limpa.
DROP FUNCTION IF EXISTS public.get_tasks_for_user(UUID, TEXT, UUID);

-- 2. Recriação: Recria a função com a lógica de filtro corrigida e aprimorada.
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
  FROM public.tarefas t -- Adiciona um alias 't' para clareza
  WHERE
    t.prefeitura_id = p_prefeitura_id
    AND t.arquivada = false
    -- Lógica de Filtro Aprimorada
    AND (
      -- Se o filtro for 'mine', força a verificação do responsável.
      (p_filter_type = 'mine' AND t.responsavel_id = public.get_my_user_id())
      OR
      -- Se um orgao_id for fornecido, verifica o órgão do responsável.
      (p_orgao_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.vinculos_usuarios vu
        WHERE vu.usuario_id = t.responsavel_id AND vu.orgao_id = p_orgao_id AND vu.ativo = true
      ))
      OR
      -- Se nenhum filtro específico for aplicado, retorna tudo (comportamento padrão).
      (p_filter_type = 'all' AND p_orgao_id IS NULL)
    )
    -- Lógica de Permissão de Visualização (permanece a mesma)
    AND (
      is_admin()
      OR
      t.created_by = public.get_my_user_id()
      OR
      t.responsavel_id = public.get_my_user_id()
      OR
      t.id IN (
        SELECT tarefa_id FROM public.observadores_tarefa
        WHERE usuario_id = public.get_my_user_id()
      )
      OR
      t.orgao_id IN (SELECT * FROM public.get_my_managed_orgao_ids())
    );
$$;

-- Garante que a permissão de execução seja mantida.
GRANT EXECUTE ON FUNCTION public.get_tasks_for_user(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tasks_for_user(UUID, TEXT, UUID) TO postgres;
