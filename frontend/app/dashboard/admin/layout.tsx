"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { mockNGOs } from "@/app/data/mockData";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { SidebarProvider, useSidebar } from "@/app/providers/SidebarContext";
import { cn } from "@/app/lib/utils";

const pageConfig: Record<string, string> = {
  '/dashboard/admin': 'Dashboard',
  '/dashboard/admin/ngo-verification': 'NGO Verification',
  '/dashboard/admin/task-moderation': 'Task Moderation',
  '/dashboard/admin/settings': 'Settings',
};

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = pageConfig[pathname] || 'Dashboard';
  const pendingNGOCount = mockNGOs.filter((ngo) => ngo.status === 'pending').length;
  const { isCollapsed, isMobileOpen } = useSidebar();

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background">
        {/* Content */}
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar pendingCount={pendingNGOCount} />

          {/* Main Content Area */}
          <div className={cn(
            "flex-1 min-h-screen flex flex-col transition-all duration-200 ease-in-out",
            isMobileOpen ? "hidden" : "",
            isCollapsed ? "lg:ml-20" : "lg:ml-64"
          )}>
            {/* Header */}
            <Header pageTitle={pageTitle} />

            {/* Page Content */}
            <main className="flex-1 overflow-auto custom-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
