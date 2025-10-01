'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppSidebarNav, type NavLink } from "./app-sidebar-nav";
import { getCurrentUserType } from "@/app/(app)/admin/usuarios/queries";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, LogOut, Lightbulb } from "lucide-react";
import { LogoutButton } from "@/app/(app)/painel/_components/logout-button";

const allLinks: NavLink[] = [
  {
    href: "/painel",
    label: "Painel",
    iconName: "LayoutDashboard",
    roles: ["municipal", "consultor", "admin"],
  },
  {
    href: "/tarefas",
    label: "Tarefas",
    iconName: "ClipboardCheck",
    roles: ["municipal", "consultor", "admin"],
  },
  {
    href: "/admin/prefeituras",
    label: "Prefeituras",
    iconName: "Building",
    roles: ["admin"],
  },
  {
    href: "/admin/consultores",
    label: "Consultores",
    iconName: "Briefcase",
    roles: ["admin"],
  },
  {
    href: "/admin/usuarios",
    label: "Usuários",
    iconName: "Users",
    roles: ["admin"],
  },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export function AppSidebar({ isCollapsed, setIsCollapsed }: AppSidebarProps) {
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserType() {
      const type = await getCurrentUserType();
      setUserType(type);
    }
    fetchUserType();
  }, []);

  const accessibleLinks = userType
    ? allLinks.filter((link) => link.roles.includes(userType))
    : [];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen border-r bg-background transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-56"
      )}
    >
      <TooltipProvider>
        <div className="flex h-full flex-col gap-4 py-4">
          <div className={cn("flex items-center gap-2 px-4", isCollapsed && "justify-center")}>
            <Link href="/painel" className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6" />
              <span className={cn("font-bold", isCollapsed && "hidden")}>Farol CEIGEP</span>
            </Link>
          </div>

          <div className="flex-1 overflow-auto px-4">
            <AppSidebarNav links={accessibleLinks} isCollapsed={isCollapsed} />
          </div>

          <div className="mt-auto px-4">
            {isCollapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <LogoutButton isCollapsed={true} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Sair</TooltipContent>
              </Tooltip>
            ) : (
              <LogoutButton isCollapsed={false} />
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute -right-5 top-1/2 -translate-y-1/2 rounded-full bg-background hover:bg-muted"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")}
            />
          </Button>
        </div>
      </TooltipProvider>
    </aside>
  );
}