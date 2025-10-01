-- Habilita a RLS na tabela, caso ainda não esteja.
ALTER TABLE public.vinculos_usuarios ENABLE ROW LEVEL SECURITY;

-- 1. Política de SELECT: Admins podem ver todos os vínculos.
CREATE POLICY "Allow admin to read all vinculos"
ON public.vinculos_usuarios
FOR SELECT
TO authenticated
USING (is_admin());

-- 2. Política de INSERT: Admins podem criar novos vínculos.
CREATE POLICY "Allow admin to insert vinculos"
ON public.vinculos_usuarios
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- 3. Política de DELETE: Admins podem remover vínculos.
CREATE POLICY "Allow admin to delete vinculos"
ON public.vinculos_usuarios
FOR DELETE
TO authenticated
USING (is_admin());
