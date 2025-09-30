create or replace function public.cpf_exists(p_cpf_hash text)
returns boolean
language plpgsql
security definer -- Executa com os privilégios do criador da função
as $$
begin
  return exists (
    select 1
    from public.usuarios
    where cpf_hash = p_cpf_hash
  );
end;
$$;
