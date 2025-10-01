-- Remove políticas anteriores, caso existam, para garantir uma aplicação limpa.
DROP POLICY IF EXISTS "Allow users to view profiles of colleagues in the same prefeitura" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to view profiles of colleagues in the same prefeitu" ON public.usuarios; -- Nome truncado pelo Postgres
DROP POLICY IF EXISTS "Allow users to view relevant profiles" ON public.usuarios;

-- Cria uma nova política de SELECT para a tabela de usuários.
-- Esta política relaxa as restrições, permitindo que um usuário veja:
-- 1. Perfis de administradores.
-- 2. Perfis de consultores.
-- 3. Perfis de colegas que pertencem à mesma prefeitura.
CREATE POLICY "Allow users to view relevant profiles"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  -- Condição 1: O perfil sendo visualizado é de um 'admin'.
  tipo = 'admin'
  OR
  -- Condição 2: O perfil sendo visualizado é de um 'consultor'.
  tipo = 'consultor'
  OR
  -- Condição 3: O perfil pertence a um colega na mesma prefeitura.
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
