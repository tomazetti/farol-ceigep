'use server'

import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getConsultores() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from("consultores")
    .select("id, nome, email, ativo")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar consultores:", error);
    return [];
  }
  return data;
}

export async function getConsultorById(id: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from("consultores")
    .select(`
      *,
      usuario:usuario_id (id, nome),
      prefeituras_vinculadas:consultores_prefeituras ( prefeitura:prefeituras (id, nome) )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar consultor:", error);
    return null;
  }
  return data;
}

export async function getConsultoresVinculados(prefeituraId: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from("consultores_prefeituras")
    .select(`
      consultor:consultores (id, nome, email)
    `)
    .eq("prefeitura_id", prefeituraId)
    .order("nome", { referencedTable: "consultores", ascending: true });

  if (error) {
    console.error("Erro ao buscar consultores vinculados:", error);
    return [];
  }
  // Extrai o objeto aninhado para retornar uma lista limpa de consultores
  return data.map((item: any) => item.consultor);
}

export async function getConsultoresDisponiveis(prefeituraId: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  // 1. Pega os IDs dos consultores já vinculados
  const { data: vinculados, error: vinculadosError } = await supabase
    .from("consultores_prefeituras")
    .select("consultor_id")
    .eq("prefeitura_id", prefeituraId);

  if (vinculadosError) {
    console.error("Erro ao buscar IDs de consultores vinculados:", vinculadosError);
    return [];
  }
  const idsVinculados = vinculados.map(v => v.consultor_id);

  // Se não houver consultores vinculados, a lista de IDs estará vazia.
  if (idsVinculados.length === 0) {
    const { data, error } = await supabase.from("consultores").select("id, nome").order("nome", { ascending: true });
    if (error) {
      console.error("Erro ao buscar todos os consultores disponíveis:", error);
      return [];
    }
    return data;
  }

  // 2. Busca todos os consultores que NÃO estão na lista de IDs
  const { data, error } = await supabase
    .from("consultores")
    .select("id, nome")
    .not("id", "in", `(${idsVinculados.join(',')})`)
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar consultores disponíveis:", error);
    return [];
  }
  return data;
}

export async function getPrefeiturasForConsultor() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: profile, error: profileError } = await supabase.rpc('get_my_profile').single();
  if (profileError || !profile || profile.tipo !== 'consultor') {
    return [];
  }

  // Busca as prefeituras vinculadas ao consultor que está vinculado ao usuário logado
  const { data, error } = await supabase
    .from('consultores')
    .select('prefeituras:consultores_prefeituras!inner(prefeitura:prefeituras(id, nome))')
    .eq('usuario_id', profile.id);

  if (error) {
    console.error("Erro ao buscar prefeituras para o consultor:", error);
    return [];
  }

  // A query retorna uma estrutura aninhada, então precisamos extrair os dados
  return data.flatMap((item: any) => item.prefeituras.map((p: any) => p.prefeitura)).filter(Boolean);
}
