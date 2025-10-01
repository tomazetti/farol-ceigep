-- 1. Limpa a política de SELECT defeituosa da tabela de usuários.
DROP POLICY IF EXISTS "Enable user select access based on role and context" ON public.usuarios;

-- 2. Recria a política de SELECT consolidada, agora usando a função auxiliar get_my_user_id() para evitar recursão.
CREATE POLICY "Enable user select access based on role and context"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  is_admin() OR
  auth_user_id = auth.uid() OR
  tipo IN ('admin', 'consultor') OR
  EXISTS (
    SELECT 1
    FROM public.vinculos_usuarios v1
    JOIN public.vinculos_usuarios v2 ON v1.prefeitura_id = v2.prefeitura_id
    WHERE
      v1.usuario_id = public.get_my_user_id() AND v1.ativo = true
      AND
      v2.usuario_id = public.usuarios.id AND v2.ativo = true
  )
);

-- 3. Refatora a função get_tasks_for_user para também usar a função auxiliar.
CREATE OR REPLACE FUNCTION public.get_tasks_for_user(p_prefeitura_id UUID)
RETURNS SETOF public.tarefas
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.tarefas
  WHERE
    prefeitura_id = p_prefeitura_id
    AND arquivada = false
    AND (
      is_admin() OR
      created_by = public.get_my_user_id() OR
      responsavel_id = public.get_my_user_id() OR
      id IN (
        SELECT tarefa_id FROM public.observadores_tarefa
        WHERE usuario_id = public.get_my_user_id()
      )
    );
$$;
