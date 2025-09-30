'use server'

import { createClient } from '@/lib/supabase/utils'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, message: 'Email e senha são obrigatórios' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, message: `Erro de autenticação: ${error.message}` }
  }

  revalidatePath('/painel', 'layout')

  return { success: true, message: 'Login bem-sucedido!' }
}
