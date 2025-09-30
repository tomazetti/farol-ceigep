'use client'

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, LayoutDashboard, LayoutGrid, Building, Briefcase, Users } from "lucide-react";

// Mapa de ícones para renderização dinâmica no cliente
const iconMap: { [key: string]: LucideIcon } = {
  LayoutDashboard,
  LayoutGrid,
  Building,
  Briefcase,
  Users,
};

export type NavLink = {
  href: string;
  label: string;
  roles: string[];
};

interface AppSidebarNavProps {
  links: (Omit<NavLink, 'roles'> & { iconName: string })[];
}

export function AppSidebarNav({ links }: AppSidebarNavProps) {
  const pathname = usePathname();

  if (!links.length) {
    return null;
  }

  return (
    <nav className="flex flex-col space-y-2">
      {links.map((link) => {
        const Icon = iconMap[link.iconName];
        const isActive = pathname.startsWith(link.href);
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-surface text-fg-strong"
                : "text-fg-muted hover:bg-surface"
            )}
          >
            {Icon && <Icon className="h-5 w-5" />}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
