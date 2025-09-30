CREATE POLICY "Allow admins full access to prefeituras"
ON public.prefeituras
FOR ALL
TO authenticated
USING (
  (SELECT tipo FROM public.usuarios WHERE auth_user_id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT tipo FROM public.usuarios WHERE auth_user_id = auth.uid()) = 'admin'
);
