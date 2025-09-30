import { AppSidebarNav, type NavLink } from "./app-sidebar-nav";

const allLinks: NavLink[] = [
  {
    href: "/painel",
    label: "Painel",
    iconName: "LayoutDashboard",
    roles: ["municipal", "consultor", "admin"],
  },
  {
    href: "/admin",
    label: "Dashboard Admin",
    iconName: "LayoutGrid",
    roles: ["admin"],
  },
  {
    href: "/admin/prefeituras",
    label: "Prefeituras",
    iconName: "Building",
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
  userType: string;
}

export function AppSidebar({ userType }: AppSidebarProps) {
  const accessibleLinks = allLinks.filter((link) =>
    link.roles.includes(userType)
  );

  return (
    <aside className="w-56 border-r border-border-brand bg-bg p-4">
      <AppSidebarNav links={accessibleLinks} />
    </aside>
  );
}
