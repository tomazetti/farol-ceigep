-- 1. Remove todas as políticas de SELECT existentes na tabela de usuários para evitar conflitos.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow admin to read all users" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to view relevant profiles" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to view profiles of colleagues in the same prefeitura" ON public.usuarios;
-- O nome abaixo pode ter sido truncado pelo Postgres em execuções anteriores.
DROP POLICY IF EXISTS "Allow users to view profiles of colleagues in the same prefeitu" ON public.usuarios;

-- 2. Cria uma única política de SELECT consolidada para a tabela de usuários.
CREATE POLICY "Enable user select access based on role and context"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  -- Regra 1: O usuário logado é um administrador (pode ver tudo).
  is_admin()
  OR
  -- Regra 2: O usuário está visualizando seu próprio perfil.
  auth_user_id = auth.uid()
  OR
  -- Regra 3: O perfil sendo visualizado é de um 'admin' ou 'consultor'.
  tipo IN ('admin', 'consultor')
  OR
  -- Regra 4: O perfil pertence a um colega na mesma prefeitura.
  EXISTS (
    SELECT 1
    FROM public.vinculos_usuarios v1
    JOIN public.vinculos_usuarios v2 ON v1.prefeitura_id = v2.prefeitura_id
    WHERE
      v1.usuario_id = (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid()) AND v1.ativo = true
      AND
      v2.usuario_id = public.usuarios.id AND v2.ativo = true
  )
);
