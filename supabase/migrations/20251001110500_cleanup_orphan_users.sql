-- Deleta os registros órfãos da tabela 'usuarios'
DELETE FROM public.usuarios
WHERE auth_user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1
  FROM auth.users
  WHERE id = public.usuarios.auth_user_id
);
