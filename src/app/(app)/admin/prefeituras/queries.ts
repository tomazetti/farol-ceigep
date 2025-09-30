'use server'

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getUfs() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase
    .from('municipios')
    .select('uf_sigla, uf_nome')
    .order('uf_nome')

  if (error) {
    console.error("Erro ao buscar UFs:", error)
    return []
  }

  // Remover duplicados
  const ufs = data.reduce((acc: { uf_sigla: string; uf_nome: string }[], current) => {
    if (!acc.find((item) => item.uf_sigla === current.uf_sigla)) {
      acc.push(current)
    }
    return acc
  }, [])

  return ufs
}

export async function getMunicipiosByUf(uf: string) {
  if (!uf) return []

  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase
    .from('municipios')
    .select('id, nome')
    .eq('uf_sigla', uf)
    .order('nome')

  if (error) {
    console.error(`Erro ao buscar municípios para a UF ${uf}:`, error)
    return []
  }

  return data
}

export async function getPrefeituraById(id: string) {
  if (!id) return null

  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase
    .from('prefeituras')
    .select('*, municipios(nome, uf_sigla)')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Erro ao buscar prefeitura com ID ${id}:`, error)
    return null
  }

  return data
}