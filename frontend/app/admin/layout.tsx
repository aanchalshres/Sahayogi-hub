"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { mockNGOs } from "@/app/data/mockData";

const pageConfig: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/ngo-verification': 'NGO Verification',
  '/admin/task-moderation': 'Task Moderation',
  '/admin/settings': 'Settings',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = pageConfig[pathname] || 'Dashboard';
  const pendingNGOCount = mockNGOs.filter((ngo) => ngo.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar pendingCount={pendingNGOCount} />

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
          {/* Header */}
          <Header pageTitle={pageTitle} />

          {/* Page Content */}
          <main className="flex-1 overflow-auto custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
