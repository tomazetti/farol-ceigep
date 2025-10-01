'use server'

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// CREATE
export async function addOrgao(prefeituraId: string, values: { nome: string, orgao_superior_id?: string }) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase.from("orgaos").insert({
    prefeitura_id: prefeituraId,
    nome: values.nome,
    orgao_superior_id: values.orgao_superior_id,
  })

  if (error) {
    return { error: `Erro ao adicionar órgão: ${error.message}` }
  }

  revalidatePath(`/admin/prefeituras/${prefeituraId}`)
  return { error: null }
}

// UPDATE
export async function updateOrgao(orgaoId: string, prefeituraId: string, values: { nome: string, orgao_superior_id?: string }) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase
    .from("orgaos")
    .update({
      nome: values.nome,
      orgao_superior_id: values.orgao_superior_id,
    })
    .eq("id", orgaoId)

  if (error) {
    return { error: `Erro ao atualizar órgão: ${error.message}` }
  }

  revalidatePath(`/admin/prefeituras/${prefeituraId}`)
  return { error: null }
}

// DELETE
export async function deleteOrgao(orgaoId: string, prefeituraId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase
    .from('orgaos')
    .delete()
    .eq('id', orgaoId)

  if (error) {
    return { error: `Erro ao excluir órgão: ${error.message}` }
  }

  revalidatePath(`/admin/prefeituras/${prefeituraId}`)
  return { error: null }
}
