-- 1. Adiciona política de SELECT para a tabela 'consultores'.
-- Permite que um usuário veja o perfil de consultor que está vinculado a ele.
CREATE POLICY "Allow users to view their own consultant profile"
ON public.consultores
FOR SELECT
TO authenticated
USING (
  usuario_id = (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())
);

-- 2. Adiciona política de SELECT para a tabela 'consultores_prefeituras'.
-- Permite que um usuário veja os vínculos de prefeitura associados ao seu perfil de consultor.
CREATE POLICY "Allow users to view their own consultant-prefeitura links"
ON public.consultores_prefeituras
FOR SELECT
TO authenticated
USING (
  consultor_id IN (SELECT id FROM public.consultores WHERE usuario_id = (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid()))
);
