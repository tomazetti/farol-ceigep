'use client'

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Session } from '@supabase/supabase-js';
import { LogoutButton } from "@/app/(app)/painel/_components/logout-button";

export function Header() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <a href="/painel" className="flex items-center space-x-2">
          <span className="inline-block font-bold text-foreground">
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