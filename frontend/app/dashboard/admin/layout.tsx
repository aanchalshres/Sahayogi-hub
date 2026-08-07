"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { SidebarProvider, useSidebar } from "@/app/providers/SidebarContext";
import { cn } from "@/app/lib/utils";

const pageConfig: Record<string, string> = {
  '/dashboard/admin': 'Dashboard',
  '/dashboard/admin/volunteers': 'Volunteer Management',
  '/dashboard/admin/ngo-verification': 'NGO Verification',
  '/dashboard/admin/volunteer-verification': 'Volunteer Verification',
  '/dashboard/admin/task-moderation': 'Task Moderation',
  '/dashboard/admin/settings': 'Settings',
};

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = pageConfig[pathname] || 'Dashboard';
  const { isCollapsed, isMobileOpen } = useSidebar();

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="h-screen w-screen overflow-hidden bg-[#F0F1F3]">
        {/* Content */}
        <div className="flex h-full">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className={cn(
            "flex-1 h-full flex flex-col transition-all duration-200 ease-in-out overflow-hidden",
            isMobileOpen ? "hidden" : "",
            isCollapsed ? "lg:ml-20" : "lg:ml-64"
          )}>
            {/* Header */}
            <Header pageTitle={pageTitle} />

            {/* Page Content */}
            <main className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto custom-scrollbar">
                {children}
              </div>
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
