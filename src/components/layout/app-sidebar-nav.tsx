'use client'

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, LayoutDashboard, LayoutGrid, Building, Briefcase, Users, ClipboardCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mapa de ícones
const iconMap: { [key: string]: LucideIcon } = {
  LayoutDashboard,
  LayoutGrid,
  Building,
  Briefcase,
  Users,
  ClipboardCheck,
};

export type NavLink = {
  href: string;
  label: string;
  iconName: string;
  roles: string[];
};

interface AppSidebarNavProps {
  links: Omit<NavLink, 'roles'>[];
  isCollapsed: boolean;
}

export function AppSidebarNav({ links, isCollapsed }: AppSidebarNavProps) {
  const pathname = usePathname();

  if (!links.length) {
    return null;
  }

  return (
    <TooltipProvider>
      <nav className="flex flex-col space-y-2">
        {links.map((link) => {
          const Icon = iconMap[link.iconName];
          const isActive = pathname.startsWith(link.href);
          
          const linkContent = (
            <>
              {Icon && <Icon className={cn("transition-all", isCollapsed ? "h-6 w-6" : "h-5 w-5")} />}
              <span className={cn("truncate", isCollapsed && "hidden")}>{link.label}</span>
            </>
          );

          const linkClasses = cn(
            "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium",
            isActive
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            isCollapsed && "justify-center space-x-0 p-2" // Ajusta o padding para ícones maiores
          );

          if (isCollapsed) {
            return (
              <Tooltip key={link.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link href={link.href} className={linkClasses}>
                    {linkContent}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-4">
                  {link.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link key={link.href} href={link.href} className={linkClasses}>
              {linkContent}
            </Link>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
