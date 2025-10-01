-- 1. Habilita RLS nas novas tabelas
ALTER TABLE public.consultores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultores_prefeituras ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para a tabela 'consultores' (Admin Full Access)
CREATE POLICY "Allow admin full access on consultores"
ON public.consultores
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 3. Políticas para a tabela 'consultores_prefeituras' (Admin Full Access)
CREATE POLICY "Allow admin full access on consultores_prefeituras"
ON public.consultores_prefeituras
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
