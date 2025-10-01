-- 1. Habilita RLS nas novas tabelas de tarefas
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observadores_tarefa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_tarefas ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para TAREFAS (Admin Full Access)
CREATE POLICY "Allow admin full access on tarefas"
ON public.tarefas
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 3. Políticas para OBSERVADORES (Admin Full Access)
CREATE POLICY "Allow admin full access on observadores_tarefa"
ON public.observadores_tarefa
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 4. Políticas para HISTORICO (Admin Full Access)
CREATE POLICY "Allow admin full access on historico_tarefas"
ON public.historico_tarefas
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
