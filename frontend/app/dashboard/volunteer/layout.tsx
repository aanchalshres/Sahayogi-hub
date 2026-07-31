"use client";

import React from "react";
import VolunteerSidebar from "@/app/dashboard/volunteer/VolunteerSidebar";
import VolunteerNavbar from "@/app/dashboard/volunteer/VolunteerNavbar";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { SidebarProvider, useSidebar } from "@/app/providers/SidebarContext";
import { cn } from "@/app/lib/utils";

function VolunteerLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobileOpen } = useSidebar();

  return (
    <ProtectedRoute allowedRoles={["volunteer"]}>
      <div className="min-h-screen bg-[#F0F1F3]">
        <div className="flex min-h-screen">
          {/* SIDEBAR */}
          <VolunteerSidebar />

          {/* MAIN */}
          <div className={cn(
            "flex-1 min-h-screen flex flex-col transition-all duration-200 ease-in-out",
            isMobileOpen ? "hidden" : "",
            isCollapsed ? "lg:ml-20" : "lg:ml-64"
          )}>
            {/* NAVBAR */}
            <VolunteerNavbar />

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 w-full">
              <div className="max-w-6xl mx-auto w-full">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <VolunteerLayoutContent>{children}</VolunteerLayoutContent>
    </SidebarProvider>
  );
}
