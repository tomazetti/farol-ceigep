'use server'

import { createServiceRoleClient } from "@/lib/supabase/utils"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createHash } from 'crypto'
import { usuarioFormSchema, usuarioEditSchema } from "./schema"
import { redirect } from "next/navigation"

export async function addUsuario(values: z.infer<typeof usuarioFormSchema>) {
  const supabase = createServiceRoleClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: values.email,
    password: values.password,
    user_metadata: {
      name: values.nome,
    },
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('unique constraint')) {
      return { error: "Este email já está em uso." }
    }
    return { error: `Erro na autenticação: ${authError.message}` }
  }

  const cpfLimpo = values.cpf.replace(/\D/g, '')
  const { error: profileError } = await supabase.from('usuarios').insert({
    id: authData.user.id,
    auth_user_id: authData.user.id,
    nome: values.nome,
    email: values.email,
    tipo: values.tipo,
    cpf_hash: createHash('sha256').update(cpfLimpo).digest('hex'),
    cpf_last4: cpfLimpo.slice(-4),
  })

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    if (profileError.message.includes('unique constraint')) {
      return { error: "Este CPF já está cadastrado." }
    }
    return { error: `Erro ao criar perfil: ${profileError.message}` }
  }

  revalidatePath('/admin/usuarios')
  return { error: null }
}

export async function updateUsuario(id: string, values: z.infer<typeof usuarioEditSchema>) {
  const supabase = createServiceRoleClient()

  const profileData: any = {
    nome: values.nome,
    email: values.email,
    tipo: values.tipo,
    ativo: values.ativo === 'true',
  }

  if (values.cpf) {
    const cpfLimpo = values.cpf.replace(/\D/g, '')
    profileData.cpf_hash = createHash('sha256').update(cpfLimpo).digest('hex')
    profileData.cpf_last4 = cpfLimpo.slice(-4)
  }

  // Atualiza a tabela 'usuarios'
  const { error: profileError } = await supabase
    .from('usuarios')
    .update(profileData)
    .eq('id', id)

  if (profileError) {
    return { error: `Erro ao atualizar perfil: ${profileError.message}` }
  }

  // Atualiza o email e o 'user_metadata' no 'auth'
  const { error: authError } = await supabase.auth.admin.updateUserById(id, {
    email: values.email,
    user_metadata: { name: values.nome },
  })

  if (authError) {
    return { error: `Erro ao atualizar dados de autenticação: ${authError.message}` }
  }

  revalidatePath('/admin/usuarios')
  revalidatePath(`/admin/usuarios/${id}`)
  return { error: null }
}

export async function deleteUsuario(id: string) {
  const supabase = createServiceRoleClient()

  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) {
    return { error: `Erro ao excluir usuário: ${error.message}` }
  }

  revalidatePath('/admin/usuarios')
  redirect('/admin/usuarios')
}