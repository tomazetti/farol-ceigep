-- Concede a permissão de execução na função para o role 'authenticated'.
-- Sem isso, os usuários logados não podem chamar a função, mesmo que ela seja SECURITY DEFINER.
GRANT EXECUTE ON FUNCTION public.get_tasks_for_user(UUID) TO authenticated;
