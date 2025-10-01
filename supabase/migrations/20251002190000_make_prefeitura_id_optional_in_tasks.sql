-- Altera a coluna prefeitura_id na tabela de tarefas para permitir valores nulos.
-- Isso é necessário para acomodar as "Tarefas CEIGEP", que não estão vinculadas a uma prefeitura específica.
ALTER TABLE public.tarefas
ALTER COLUMN prefeitura_id DROP NOT NULL;
