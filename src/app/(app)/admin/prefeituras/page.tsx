import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { PrefeituraActions } from "./_components/prefeitura-actions";

export default async function PrefeiturasPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: prefeituras, error } = await supabase
    .from("prefeituras")
    .select("*, municipios(nome, uf_sigla)")
    .order("nome", { ascending: true });

  if (error) {
    return <p className="text-destructive">{error.message}</p>;
  }

  return <PrefeituraActions prefeituras={prefeituras || []} />;
}
