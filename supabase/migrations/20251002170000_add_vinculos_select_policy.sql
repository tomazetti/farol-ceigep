-- Adiciona uma política de SELECT para que usuários possam ler seus próprios vínculos.
CREATE POLICY "Allow users to read their own vinculos"
ON public.vinculos_usuarios
FOR SELECT
TO authenticated
USING (
  usuario_id = (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())
);
