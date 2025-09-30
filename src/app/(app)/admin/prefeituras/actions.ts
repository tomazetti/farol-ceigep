'use server'

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

interface AddPrefeituraValues {
  nome: string
  municipio_id: string
}

export async function addPrefeitura(values: AddPrefeituraValues) {
  const { nome, municipio_id } = values

  if (!nome || !municipio_id) {
    return { error: "Todos os campos são obrigatórios." }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase.from("prefeituras").insert({
    nome,
    municipio_id,
  })

  if (error) {
    // Tratar erro de violação de chave única (prefeitura já cadastrada para o município)
    if (error.code === '23505') {
      return { error: "Já existe uma prefeitura cadastrada para este município." }
    }
    return { error: `Erro ao adicionar prefeitura: ${error.message}` }
  }

  revalidatePath("/admin/prefeituras")
  return { error: null }
}

export async function updatePrefeitura(id: string, values: AddPrefeituraValues) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase
    .from('prefeituras')
    .update(values)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: "Já existe uma prefeitura cadastrada para este município." }
    }
    return { error: `Erro ao atualizar prefeitura: ${error.message}` }
  }

  revalidatePath(`/admin/prefeituras/${id}`)
  revalidatePath('/admin/prefeituras')
  return { error: null }
}

export async function deletePrefeitura(id: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase
    .from('prefeituras')
    .delete()
    .eq('id', id)

  if (error) {
    // Exemplo: erro de violação de chave estrangeira
    if (error.code === '23503') {
      return { error: "Não é possível excluir a prefeitura, pois ela possui registros vinculados (ex: usuários, tarefas)." }
    }
    return { error: `Erro ao excluir prefeitura: ${error.message}` }
  }

  revalidatePath('/admin/prefeituras')
  redirect('/admin/prefeituras')
}