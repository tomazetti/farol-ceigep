-- Função para pegar o ID do usuário autenticado de forma segura
CREATE OR REPLACE FUNCTION public.get_auth_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o tipo do usuário logado a partir da tabela 'usuarios'
CREATE OR REPLACE FUNCTION public.get_current_usuario_tipo()
RETURNS TEXT AS $$
DECLARE
  user_tipo TEXT;
BEGIN
  SELECT tipo INTO user_tipo
  FROM public.usuarios
  WHERE auth_user_id = public.get_auth_user_id();
  RETURN user_tipo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função booleana para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_current_usuario_tipo() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para obter o perfil do usuário logado
CREATE OR REPLACE VIEW public.current_usuario AS
SELECT u.*
FROM public.usuarios u
WHERE u.auth_user_id = auth.uid();
