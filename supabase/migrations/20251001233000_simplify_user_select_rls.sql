-- 1. Limpeza Drástica: Remove todas as políticas de SELECT da tabela de usuários.
DROP POLICY IF EXISTS "Enable user select access based on role and context" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to view relevant profiles" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to view relevant colleague and staff profiles" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to view profiles of colleagues in the same prefeitura" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to view profiles of colleagues in the same prefeitu" ON public.usuarios; -- Nome truncado

-- 2. Recriação - Política Essencial de SELECT: Admin vê tudo, e usuários veem a si mesmos.
-- Esta política é a única política de SELECT que a tabela terá, garantindo simplicidade.
CREATE POLICY "Allow basic profile select access"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  -- Regra 1: O usuário logado é um administrador.
  is_admin()
  OR
  -- Regra 2: O usuário está visualizando seu próprio perfil.
  auth_user_id = auth.uid()
);
