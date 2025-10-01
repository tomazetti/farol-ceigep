-- 1. Remove a política de UPDATE recursiva e incorreta.
DROP POLICY IF EXISTS "Allow users to update their own tasks" ON public.tarefas;

-- 2. Recria a política de UPDATE da forma correta, sem sub-queries na própria tabela.
-- A lógica é a mesma da política de SELECT, aplicada diretamente à linha que está sendo atualizada.
CREATE POLICY "Allow users to update their own tasks"
ON public.tarefas
FOR UPDATE
TO authenticated
USING (
  is_admin() OR
  created_by = (select id from public.usuarios where auth_user_id = auth.uid()) OR
  responsavel_id = (select id from public.usuarios where auth_user_id = auth.uid()) OR
  id IN (
    SELECT tarefa_id FROM public.observadores_tarefa
    WHERE usuario_id = (select id from public.usuarios where auth_user_id = auth.uid())
  )
)
WITH CHECK (true);
