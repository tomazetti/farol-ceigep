'use client'

import { Button } from "@/components/ui/button";
import { logout } from "../actions";
import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  isCollapsed?: boolean;
}

export function LogoutButton({ isCollapsed = false }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => {
      logout();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button 
        type="submit" 
        variant="ghost" 
        disabled={isPending} 
        className={cn("w-full justify-start", isCollapsed && "justify-center px-0")}
        aria-label="Sair"
      >
        {isPending ? (
          <Loader2 className={cn("animate-spin", isCollapsed ? "h-6 w-6" : "h-5 w-5")} />
        ) : (
          <LogOut className={cn(isCollapsed ? "h-6 w-6" : "h-5 w-5")} />
        )}
        <span className={cn("ml-2", isCollapsed && "hidden")}>Sair</span>
      </Button>
    </form>
  );
}
