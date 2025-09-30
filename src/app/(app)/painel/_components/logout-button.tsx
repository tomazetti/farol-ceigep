'use client'

import { Button } from "@/components/ui/button";
import { logout } from "../actions";
import { useTransition } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => {
      logout();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" variant="ghost" size="icon" disabled={isPending} aria-label="Sair">
        {isPending ? (
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        <span className="sr-only">Sair</span>
      </Button>
    </form>
  );
}
