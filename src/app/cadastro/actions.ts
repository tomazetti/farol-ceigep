'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/utils'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export async function signup(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const cpfRaw = formData.get('cpf') as string

  if (!nome || !email || !password || !cpfRaw) {
    return { success: false, message: 'Todos os campos são obrigatórios' }
  }

  const cpf = cpfRaw.replace(/\D/g, '')
  if (cpf.length !== 11) {
      return { success: false, message: 'CPF inválido' }
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: nome,
      }
    }
  })

  if (authError) {
    return { success: false, message: `Erro ao criar usuário: ${authError.message}` }
  }
  
  if (!authData.user) {
    return { success: false, message: 'Usuário não foi criado. Tente novamente.' }
  }

  const cpf_hash = createHash('sha256').update(cpf).digest('hex')
  const cpf_last4 = cpf.slice(-4)

  const supabaseAdmin = createServiceRoleClient()
  const { error: profileError } = await supabaseAdmin
    .from('usuarios')
    .insert({
      auth_user_id: authData.user.id,
      nome,
      email,
      cpf_hash,
      cpf_last4,
      tipo: 'municipal',
    })

  if (profileError) {
    console.error("Erro ao criar perfil:", profileError)
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return { success: false, message: `Erro ao finalizar cadastro: ${profileError.message}` }
  }

  return { 
    success: true, 
    message: 'Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.' 
  }
}
