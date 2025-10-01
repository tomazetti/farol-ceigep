-- Habilita a RLS na tabela de usuários, caso ainda não esteja.
-- A política anterior já faz isso, mas é bom garantir.
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Adiciona a nova política para administradores.
-- A política existente para usuários verem seus próprios perfis continua valendo.
CREATE POLICY "Allow admin to read all usuarios"
ON public.usuarios
FOR SELECT
TO authenticated
USING (is_admin());
