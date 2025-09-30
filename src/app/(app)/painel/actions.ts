'use server'

import { createClient } from "@/lib/supabase/utils"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function logout() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  await supabase.auth.signOut()
  
  return redirect('/login')
}
