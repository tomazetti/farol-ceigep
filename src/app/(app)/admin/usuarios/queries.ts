'use server'

import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getCurrentUserType() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: profile, error } = await supabase.rpc('get_my_profile').single();

  if (error || !profile) {
    console.error("Erro ao buscar tipo do usuário:", error);
    return null;
  }

  return profile.tipo;
}