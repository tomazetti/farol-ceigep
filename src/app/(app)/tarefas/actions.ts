'use server'

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { taskFormSchema } from "./schema";

async function getUserId() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Usuário não autenticado.");
  }
  // Busca o ID do perfil do usuário na tabela 'usuarios'
  const { data: profile, error } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();
  
  if (error || !profile) {
    throw new Error("Perfil de usuário não encontrado.");
  }
  return profile.id;
}

// CREATE
export async function createTask(prefeituraId: string | null, values: z.infer<typeof taskFormSchema>) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const created_by = await getUserId();

  const { error } = await supabase.from("tarefas").insert({
    prefeitura_id: prefeituraId,
    titulo: values.titulo,
    descricao: values.descricao,
    responsavel_id: values.responsavel_id,
    created_by: created_by,
    status: 'a_fazer',
  });

  if (error) {
    console.error("Erro ao criar tarefa:", error);
    return { error: `Erro ao criar tarefa: ${error.message}` };
  }

  revalidatePath('/tarefas');
  return { error: null };
}

// UPDATE
export async function updateTask(taskId: string, values: z.infer<typeof taskFormSchema>) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const updated_by = await getUserId();

  const { error } = await supabase
    .from("tarefas")
    .update({
      titulo: values.titulo,
      descricao: values.descricao,
      responsavel_id: values.responsavel_id,
      updated_by: updated_by,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return { error: `Erro ao atualizar tarefa: ${error.message}` };
  }

  revalidatePath('/tarefas');
  return { error: null };
}

// UPDATE STATUS (for Drag-and-Drop)
export async function updateTaskStatus(taskId: string, fromStatus: string, toStatus: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const alterado_por = await getUserId();

  // 1. Atualiza o status da tarefa
  const { error: updateError } = await supabase
    .from("tarefas")
    .update({ status: toStatus, updated_by: alterado_por, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (updateError) {
    console.error("Erro ao atualizar status da tarefa:", updateError);
    return { error: `Erro ao atualizar status: ${updateError.message}` };
  }

  // 2. Registra a mudança no histórico
  const { error: historyError } = await supabase.from("historico_tarefas").insert({
    tarefa_id: taskId,
    de_status: fromStatus,
    para_status: toStatus,
    alterado_por: alterado_por,
  });

  if (historyError) {
    // Idealmente, aqui teríamos um rollback ou um log mais robusto.
    // Por enquanto, apenas logamos o erro.
    console.error("Erro ao registrar histórico da tarefa:", historyError);
    // Não retornamos o erro para não quebrar a UI, mas a inconsistência é logada.
  }

  revalidatePath('/tarefas');
  return { error: null };
}

// ARCHIVE
export async function archiveTask(taskId: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const updated_by = await getUserId();

  const { error } = await supabase
    .from("tarefas")
    .update({ arquivada: true, updated_by: updated_by, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) {
    console.error("Erro ao arquivar tarefa:", error);
    return { error: `Erro ao arquivar tarefa: ${error.message}` };
  }

  revalidatePath('/tarefas');
  revalidatePath('/arquivadas');
  return { error: null };
}

