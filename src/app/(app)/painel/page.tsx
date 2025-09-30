import { createClient } from "@/lib/supabase/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "./_components/logout-button";

export default async function PainelPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/login");
  }

  return (
    <div className="px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold text-fg-strong">Painel Principal</h1>
      <div className="p-6 bg-white rounded-lg shadow-s1 border border-border-brand">
        <p className="text-fg">
          Bem-vindo, <span className="font-semibold text-fg-strong">{session.user.email}</span>!
        </p>
        <p className="text-fg-muted mt-2">Este é um conteúdo protegido.</p>
      </div>
    </div>
  );
}
