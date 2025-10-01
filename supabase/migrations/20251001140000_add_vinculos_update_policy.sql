-- 4. Política de UPDATE: Admins podem atualizar vínculos existentes.
CREATE POLICY "Allow admin to update vinculos"
ON public.vinculos_usuarios
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
