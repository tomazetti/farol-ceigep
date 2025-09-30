'use server'

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getSecretariasByPrefeituraId(prefeituraId: string) {
  if (!prefeituraId) return []

  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase
    .from('secretarias')
    .select('*')
    .eq('prefeitura_id', prefeituraId)
    .order('nome')

  if (error) {
    console.error(`Erro ao buscar secretarias para a prefeitura ${prefeituraId}:`, error)
    return []
  }

  return data
}
