-- Política de SELECT para HISTORICO_TAREFAS
-- Permite que um usuário veja o histórico de uma tarefa se ele tiver permissão para ver a tarefa em si.
CREATE POLICY "Allow users to view history for their tasks"
ON public.historico_tarefas
FOR SELECT
TO authenticated
USING (
  -- A subquery na tabela `tarefas` é automaticamente filtrada pela RLS dessa tabela.
  -- Se o `SELECT` na linha da tarefa for bem-sucedido, o usuário poderá ver o histórico.
  EXISTS (
    SELECT 1 FROM public.tarefas
    WHERE id = tarefa_id
  )
);
