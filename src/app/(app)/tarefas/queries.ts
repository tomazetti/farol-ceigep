'use server'

import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getMyTasks() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  // Obtém o ID do perfil do usuário logado de forma segura
  const { data: userId, error: userIdError } = await supabase.rpc('get_my_user_id').single();
  if (userIdError || !userId) {
    console.error("Não foi possível obter o ID do usuário logado:", userIdError);
    return [];
  }

  const { data, error } = await supabase
    .from("tarefas")
    .select(`
      id,
      titulo,
      status,
      responsavel:responsavel_id (id, nome)
    `)
    .eq("responsavel_id", userId)
    .eq("arquivada", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar minhas tarefas:", error);
    return [];
  }

  return data;
}