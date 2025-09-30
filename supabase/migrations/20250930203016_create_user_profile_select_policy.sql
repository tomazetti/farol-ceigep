CREATE POLICY "Allow authenticated users to read their own profile"
ON public.usuarios
FOR SELECT
TO authenticated
USING (auth.uid() = auth_user_id);
