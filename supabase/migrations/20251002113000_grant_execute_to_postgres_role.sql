-- Concede a permissão de execução na função para o role 'postgres'.
-- Isso é necessário porque as funções SECURITY DEFINER executam como o usuário 'postgres',
-- e precisam de permissão explícita para chamar outras funções.
GRANT EXECUTE ON FUNCTION public.get_my_user_id() TO postgres;
GRANT EXECUTE ON FUNCTION public.get_my_managed_orgao_ids() TO postgres;
