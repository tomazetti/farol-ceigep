'use server'

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Retorna todos os usuários vinculados a uma prefeitura usando a função RPC segura
export async function getUsuariosVinculados(prefeituraId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: colleagues, error: colleaguesError } = await supabase
    .rpc('get_colleagues_in_prefeitura', { p_prefeitura_id: prefeituraId })

  if (colleaguesError) {
    console.error("Erro ao buscar colegas:", colleaguesError)
    return []
  }

  const { data, error } = await supabase
    .from("vinculos_usuarios")
    .select(`
      id,
      orgao_id,
      usuario_id,
      orgaos (nome)
    `)
    .eq("prefeitura_id", prefeituraId)
    .eq("ativo", true)

  if (error) {
    console.error("Erro ao buscar vínculos:", error)
    return []
  }

  const result = data.map(vinculo => {
    const usuario = colleagues.find(c => c.id === vinculo.usuario_id)
    return {
      ...vinculo,
      usuarios: usuario ? { id: usuario.id, nome: usuario.nome, email: usuario.email } : null
    }
  })

  return result
}

import { getPrefeiturasForConsultor } from "../consultores/queries";

// ... (outras queries)

// Nova função unificada para obter o contexto de prefeitura do usuário logado
export async function getCurrentUserContext() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: profile, error: profileError } = await supabase.rpc('get_my_profile').single();
  if (profileError || !profile) {
    console.error("Erro ao buscar perfil do usuário para obter contexto:", profileError);
    return null;
  }

  if (profile.tipo === 'municipal') {
    const { data: vinculo } = await supabase
      .from('vinculos_usuarios')
      .select('prefeitura_id')
      .eq('usuario_id', profile.id)
      .eq('ativo', true)
      .single();
    return { type: 'municipal', prefeituraId: vinculo?.prefeitura_id || null };
  }

  if (profile.tipo === 'consultor') {
    const prefeituras = await getPrefeiturasForConsultor();
    return { type: 'consultor', prefeituras };
  }

  if (profile.tipo === 'admin') {
    const { data: prefeituras, error } = await supabase.from('prefeituras').select('id, nome');
    if (error) {
      console.error("Erro ao buscar todas as prefeituras para admin:", error);
      return { type: 'admin', prefeituras: [] };
    }
    return { type: 'admin', prefeituras: prefeituras || [] };
  }
  
  return null;
}

export async function getUsuariosDisponiveis() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // 1. Pega os IDs dos usuários que já possuem um vínculo ativo
  const { data: vinculados, error: vinculadosError } = await supabase
    .from('vinculos_usuarios')
    .select('usuario_id')
    .eq('ativo', true)

  if (vinculadosError) {
    console.error("Erro ao buscar usuários com vínculo:", vinculadosError)
    return []
  }
  const idsVinculados = vinculados.map(v => v.usuario_id)

  // 2. Busca todos os usuários que NÃO estão na lista de IDs
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome')
    .not('id', 'in', `(${idsVinculados.join(',')})`)
    .order('nome', { ascending: true })

  if (error) {
    console.error("Erro ao buscar usuários disponíveis:", error)
    return []
  }
  return data
}
