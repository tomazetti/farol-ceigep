-- 1. Renomeia a tabela de 'secretarias' para 'orgaos'
ALTER TABLE public.secretarias RENAME TO orgaos;

-- 2. Adiciona a coluna para a hierarquia (auto-referência)
ALTER TABLE public.orgaos
ADD COLUMN orgao_superior_id UUID REFERENCES public.orgaos(id) ON DELETE SET NULL;

-- 3. Renomeia a coluna de chave estrangeira em 'vinculos_usuarios'
ALTER TABLE public.vinculos_usuarios
RENAME COLUMN secretaria_id TO orgao_id;

-- 4. Renomeia as políticas de RLS para refletir a mudança de nome da tabela
ALTER POLICY "Allow admin to read all secretarias" ON public.orgaos RENAME TO "Allow admin to read all orgaos";
ALTER POLICY "Allow admin to insert secretarias" ON public.orgaos RENAME TO "Allow admin to insert orgaos";
ALTER POLICY "Allow admin to update secretarias" ON public.orgaos RENAME TO "Allow admin to update orgaos";
ALTER POLICY "Allow admin to delete secretarias" ON public.orgaos RENAME TO "Allow admin to delete orgaos";
