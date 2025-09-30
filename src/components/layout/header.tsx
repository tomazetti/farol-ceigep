import { createClient } from "@/lib/supabase/utils";
import { cookies } from "next/headers";
import { LogoutButton } from "@/app/(app)/painel/_components/logout-button";

export async function Header() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border-brand bg-bg">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <a href="/painel" className="flex items-center space-x-2">
          <span className="inline-block font-bold text-fg-strong">
            Farol CEIGEP
          </span>
        </a>
        <nav>
          {session && <LogoutButton />}
        </nav>
      </div>
    </header>
  );
}
