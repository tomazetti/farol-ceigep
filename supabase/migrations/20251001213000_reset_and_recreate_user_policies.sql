-- 1. Limpeza Drástica: Remove todas as políticas de RLS da tabela de usuários.
-- Isso garante um estado inicial limpo e evita conflitos com políticas antigas.
DROP POLICY IF EXISTS "Enable user select access based on role and context" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to view relevant profiles" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to view profiles of colleagues in the same prefeitura" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to view profiles of colleagues in the same prefeitu" ON public.usuarios; -- Nome truncado
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow admin to read all users" ON public.usuarios;
DROP POLICY IF EXISTS "Allow admin to manage all users" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to manage their own profile" ON public.usuarios;


-- 2. Recriação - Política de Acesso Total para Administradores.
CREATE POLICY "Allow admin to manage all users"
ON public.usuarios
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());


-- 3. Recriação - Política Essencial: Usuários podem gerenciar seu próprio perfil.
-- Isso é CRÍTICO para o login e para que o usuário possa editar seus próprios dados.
CREATE POLICY "Allow users to manage their own profile"
ON public.usuarios
FOR ALL
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());


-- 4. Recriação - Política de Visualização Adicional (Apenas SELECT).
-- Permite que usuários vejam perfis de colegas, admins e consultores.
-- Esta política é aditiva (OR) à política "manage their own profile".
CREATE POLICY "Allow users to view relevant colleague and staff profiles"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  -- O perfil sendo visualizado é de um 'admin' ou 'consultor'.
  tipo IN ('admin', 'consultor')
  OR
  -- O perfil pertence a um colega na mesma prefeitura.
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
