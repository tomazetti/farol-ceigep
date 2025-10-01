-- 1. Limpeza Drástica: Remove todas as funções complexas relacionadas a tarefas e filtros.
DROP FUNCTION IF EXISTS public.get_tasks_for_user(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS public.get_tasks_for_user(UUID);
DROP FUNCTION IF EXISTS public.get_my_managed_orgao_ids();
DROP FUNCTION IF EXISTS public.get_my_filterable_orgaos();
DROP FUNCTION IF EXISTS public.get_task_details(UUID);

-- 2. Restaura a integridade dos dados: Torna a coluna prefeitura_id obrigatória novamente.
-- Isso garante que toda tarefa, a partir de agora, deva pertencer a uma prefeitura.
ALTER TABLE public.tarefas
ALTER COLUMN prefeitura_id SET NOT NULL;
