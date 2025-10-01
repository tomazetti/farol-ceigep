-- Adiciona a política de UPDATE para administradores na tabela de usuários.
-- Isso permitirá que eles alterem o status (ativo/inativo) e outros dados.
CREATE POLICY "Allow admin to update usuarios"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Adiciona a chave estrangeira com exclusão em cascata.
-- Isso garante que ao deletar um usuário no 'auth', o perfil em 'public.usuarios' seja deletado junto.
ALTER TABLE public.usuarios
ADD CONSTRAINT fk_auth_user_id
FOREIGN KEY (auth_user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
