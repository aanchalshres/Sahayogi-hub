"use client";

import { useState } from "react";
import OrgSidebar from "@/app/dashboard/org/OrgSidebar";
import OrgNavbar from "@/app/dashboard/org/OrgNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex overflow-hidden bg-[#F0F1F3]">

      {/* SIDEBAR */}
      <OrgSidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* NAVBAR */}
        <OrgNavbar sidebarOpen={sidebarOpen} />

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-1">
          {children}
        </div>

      </div>
    </div>
  );
}