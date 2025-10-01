'use server'

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getOrgaosByPrefeituraId(prefeituraId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase
    .from("orgaos")
    .select(`
      *,
      orgaos:orgao_superior_id (nome)
    `)
    .eq("prefeitura_id", prefeituraId)
    .order("nome", { ascending: true })

  if (error) {
    console.error("Erro ao buscar órgãos:", error)
    return []
  }

  return data
}