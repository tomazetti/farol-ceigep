-- Permite que usuários não-admin vejam as tarefas a que têm acesso
CREATE POLICY "Allow users to view their own tasks"
ON public.tarefas
FOR SELECT
TO authenticated
USING (
  -- Admins podem ver tudo (já coberto pela outra política, mas bom ter redundância)
  is_admin() OR
  -- Usuário é o criador da tarefa
  created_by = (select id from public.usuarios where auth_user_id = auth.uid()) OR
  -- Usuário é o responsável pela tarefa
  responsavel_id = (select id from public.usuarios where auth_user_id = auth.uid()) OR
  -- Usuário é um observador da tarefa
  id IN (
    SELECT tarefa_id FROM public.observadores_tarefa
    WHERE usuario_id = (select id from public.usuarios where auth_user_id = auth.uid())
  )
);
