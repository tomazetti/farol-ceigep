'use server'

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

interface SecretariaFormValues {
  nome: string
}

// CREATE
export async function addSecretaria(prefeituraId: string, values: SecretariaFormValues) {
  if (!prefeituraId || !values.nome) {
    return { error: "O nome da secretaria é obrigatório." }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase.from("secretarias").insert({
    prefeitura_id: prefeituraId,
    nome: values.nome,
  })

  if (error) {
    return { error: `Erro ao adicionar secretaria: ${error.message}` }
  }

  revalidatePath(`/admin/prefeituras/${prefeituraId}`)
  return { error: null }
}

// UPDATE
export async function updateSecretaria(secretariaId: string, prefeituraId: string, values: SecretariaFormValues) {
  if (!secretariaId || !prefeituraId || !values.nome) {
    return { error: "O nome da secretaria é obrigatório." }
  }
  
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase
    .from('secretarias')
    .update({ nome: values.nome })
    .eq('id', secretariaId)

  if (error) {
    return { error: `Erro ao atualizar secretaria: ${error.message}` }
  }

  revalidatePath(`/admin/prefeituras/${prefeituraId}`)
  return { error: null }
}

// DELETE
export async function deleteSecretaria(secretariaId: string, prefeituraId: string) {
  if (!secretariaId || !prefeituraId) {
    return { error: "ID da secretaria ou prefeitura inválido." }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase
    .from('secretarias')
    .delete()
    .eq('id', secretariaId)

  if (error) {
    if (error.code === '23503') {
      return { error: "Não é possível excluir a secretaria, pois ela possui registros vinculados." }
    }
    return { error: `Erro ao excluir secretaria: ${error.message}` }
  }

  revalidatePath(`/admin/prefeituras/${prefeituraId}`)
  return { error: null }
}
