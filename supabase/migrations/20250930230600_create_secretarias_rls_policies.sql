-- 1. Politica de SELECT: Admins podem ver todas as secretarias.
CREATE POLICY "Allow admin to read all secretarias"
ON public.secretarias
FOR SELECT
TO authenticated
USING (is_admin());

-- 2. Politica de INSERT: Admins podem adicionar novas secretarias.
CREATE POLICY "Allow admin to insert secretarias"
ON public.secretarias
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- 3. Politica de UPDATE: Admins podem atualizar secretarias.
CREATE POLICY "Allow admin to update secretarias"
ON public.secretarias
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 4. Politica de DELETE: Admins podem excluir secretarias.
CREATE POLICY "Allow admin to delete secretarias"
ON public.secretarias
FOR DELETE
TO authenticated
USING (is_admin());
