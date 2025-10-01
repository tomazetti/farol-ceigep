'use client'

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BreadcrumbNav } from "@/components/layout/breadcrumb-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedState = localStorage.getItem("sidebar-collapsed");
    if (storedState) {
      setIsCollapsed(JSON.parse(storedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="flex min-h-screen">
      <AppSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-56'}`}>
        <BreadcrumbNav />
        {children}
      </main>
    </div>
  );
}
