"use client";

import { useState, useCallback } from "react";
import VolunteerSidebar from "@/app/dashboard/volunteer/VolunteerSidebar";
import VolunteerNavbar from "@/app/dashboard/volunteer/VolunteerNavbar";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  return (
    <ProtectedRoute allowedRoles={["volunteer"]}>
      <div className="h-screen flex overflow-hidden bg-[#F0F1F3]">
        {/* SIDEBAR */}
        <VolunteerSidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* MAIN */}
        <div className="flex-1 flex flex-col min-h-0 w-full">
          {/* NAVBAR */}
          <VolunteerNavbar />

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto p-6 w-full">
            <div className="max-w-6xl mx-auto w-full">{children}</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
