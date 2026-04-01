"use client";

import { ReactNode, useState } from "react";
import Navbar from "./Navbar"; // This is your sidebar component
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  role?: "volunteer" | "organization" | "admin";
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role = "volunteer" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F0F1F3] text-[#111827]">
      
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Navbar role={role} isOpen sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay background */}
          <div
            className="absolute inset-0 bg-[#111827]/20"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10">
            <Navbar role={role} isOpen sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-[#CACDD3] bg-[#B9C0D4]/80 backdrop-blur-md px-6 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-[#111827]" />
          </button>
          <span className="font-bold text-[#111827]">Sahayogi</span>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;