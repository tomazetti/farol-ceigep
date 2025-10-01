-- 1. Política de UPDATE para TAREFAS
-- Permite que um usuário atualize uma tarefa se ele tiver permissão para vê-la.
CREATE POLICY "Allow users to update their own tasks"
ON public.tarefas
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT t.id FROM public.tarefas t
    WHERE
      is_admin() OR
      t.created_by = (select id from public.usuarios where auth_user_id = auth.uid()) OR
      t.responsavel_id = (select id from public.usuarios where auth_user_id = auth.uid()) OR
      t.id IN (
        SELECT ot.tarefa_id FROM public.observadores_tarefa ot
        WHERE ot.usuario_id = (select id from public.usuarios where auth_user_id = auth.uid())
      )
  )
)
WITH CHECK (true); -- O WITH CHECK pode ser mais restritivo, mas por enquanto `true` é suficiente.

-- 2. Política de INSERT para HISTORICO_TAREFAS
-- Permite que um usuário insira no histórico se ele tiver acesso à tarefa relacionada.
CREATE POLICY "Allow users to insert into task history"
ON public.historico_tarefas
FOR INSERT
TO authenticated
WITH CHECK (
  -- A subquery em `tarefas` será automaticamente filtrada pela RLS da tabela `tarefas`.
  -- Se o usuário pode ver a tarefa, ele pode inserir em seu histórico.
  EXISTS (
    SELECT 1 FROM public.tarefas
    WHERE id = tarefa_id
  )
);
