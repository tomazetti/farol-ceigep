'use server'

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { z } from "zod"
import { vinculoFormSchema } from "./schema"

// CREATE
export async function vincularUsuario(prefeituraId: string, values: z.infer<typeof vinculoFormSchema>) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const insertData: {
    prefeitura_id: string;
    usuario_id: string;
    orgao_id?: string;
    ativo: boolean;
  } = {
    prefeitura_id: prefeituraId,
    usuario_id: values.usuario_id,
    ativo: true,
  }

  if (values.orgao_id) {
    insertData.orgao_id = values.orgao_id
  }

  const { error } = await supabase.from("vinculos_usuarios").insert(insertData)

  if (error) {
    if (error.code === '23505') { // unique constraint violation
      return { error: "Este usuário já possui um vínculo ativo." }
    }
    return { error: `Erro ao vincular usuário: ${error.message}` }
  }

  revalidatePath(`/admin/prefeituras/${prefeituraId}`)
  return { error: null }
}

// UPDATE
export async function updateVinculo(vinculoId: string, prefeituraId: string, values: z.infer<typeof vinculoFormSchema>) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase
    .from("vinculos_usuarios")
    .update({
      orgao_id: values.orgao_id || null, // Converte undefined/'' para null
    })
    .eq("id", vinculoId)

  if (error) {
    console.error("Erro ao atualizar vínculo:", error)
    return { error: `Erro ao atualizar vínculo: ${error.message}` }
  }

  revalidatePath(`/admin/prefeituras/${prefeituraId}`)
  return { error: null }
}

// DELETE
export async function desvincularUsuario(vinculoId: string, prefeituraId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase
    .from('vinculos_usuarios')
    .delete()
    .eq('id', vinculoId)

  if (error) {
    return { error: `Erro ao desvincular usuário: ${error.message}` }
  }

  revalidatePath(`/admin/prefeituras/${prefeituraId}`)
  return { error: null }
}
