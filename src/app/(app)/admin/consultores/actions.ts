'use server'

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { consultorFormSchema } from "./schema";

// CREATE
export async function createConsultor(values: z.infer<typeof consultorFormSchema>) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.from("consultores").insert({
    nome: values.nome,
    email: values.email,
    usuario_id: values.usuario_id || null,
  });

  if (error) {
    console.error("Erro ao criar consultor:", error);
    return { error: `Erro ao criar consultor: ${error.message}` };
  }

  revalidatePath('/admin/consultores');
  return { error: null };
}

// UPDATE
export async function updateConsultor(id: string, values: z.infer<typeof consultorFormSchema>) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase
    .from("consultores")
    .update({
      nome: values.nome,
      email: values.email,
      usuario_id: values.usuario_id || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar consultor:", error);
    return { error: `Erro ao atualizar consultor: ${error.message}` };
  }

  revalidatePath(`/admin/consultores`);
  revalidatePath(`/admin/consultores/${id}`);
  return { error: null };
}

// DELETE
export async function deleteConsultor(id: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.from("consultores").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir consultor:", error);
    return { error: `Erro ao excluir consultor: ${error.message}` };
  }

  revalidatePath('/admin/consultores');
  return { error: null };
}

// VINCULAR CONSULTOR A PREFEITURA
export async function vincularConsultorAPrefeitura(consultorId: string, prefeituraId: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.from("consultores_prefeituras").insert({
    consultor_id: consultorId,
    prefeitura_id: prefeituraId,
  });

  if (error) {
    console.error("Erro ao vincular consultor:", error);
    return { error: `Erro ao vincular consultor: ${error.message}` };
  }

  revalidatePath(`/admin/consultores/${consultorId}`);
  return { error: null };
}

// DESVINCULAR CONSULTOR DE PREFEITURA
export async function desvincularConsultorDePrefeitura(consultorId: string, prefeituraId: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase
    .from("consultores_prefeituras")
    .delete()
    .eq("consultor_id", consultorId)
    .eq("prefeitura_id", prefeituraId);

  if (error) {
    console.error("Erro ao desvincular consultor:", error);
    return { error: `Erro ao desvincular consultor: ${error.message}` };
  }

  revalidatePath(`/admin/consultores/${consultorId}`);
  return { error: null };
}
