create or replace view public.current_usuario as
select u.*
from public.usuarios u
where u.auth_user_id = auth.uid();
