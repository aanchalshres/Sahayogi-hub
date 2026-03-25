"use client";

import { useState } from "react";
import OrgSidebar from "@/app/dashboard/org/OrgSidebar";
import OrgNavbar from "@/app/dashboard/org/OrgNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex">
      {/* SIDEBAR */}
      <OrgSidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* MAIN SECTION: Navbar + Content */}
      <div className="flex-1 flex flex-col">
        {/* NAVBAR */}
        <OrgNavbar sidebarOpen={sidebarOpen} />

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-[#F0F1F3] p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}