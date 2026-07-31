"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { useSidebar } from "@/app/providers/SidebarContext";
import {
  LayoutDashboard,
  Plus,
  FileText,
  Users,
  UserCheck,
  User,
  LogOut,
  Bell,
  ShieldCheck,
  ClipboardCheck,
  BarChart3,
  Star,
  Award,
  Calendar,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard/ngo", icon: LayoutDashboard },
  { name: "Post Task", href: "/dashboard/ngo/post-task", icon: Plus },
  // { name: "My Tasks", href: "/dashboard/ngo/tasks", icon: FileText },
  { name: "Applications", href: "/dashboard/ngo/applications", icon: Users },
  { name: "Volunteers", href: "/dashboard/ngo/participations", icon: UserCheck },
  // { name: "Verification", href: "/dashboard/ngo/verification", icon: ShieldCheck },
  { name: "Attendance", href: "/dashboard/ngo/attendance", icon: ClipboardCheck },
  { name: "Reports", href: "/dashboard/ngo/reports", icon: BarChart3 },
  { name: "Ratings", href: "/dashboard/ngo/ratings", icon: Star },
  { name: "Certificates", href: "/dashboard/ngo/certificates", icon: Award },
  // { name: "Schedule", href: "/dashboard/ngo/schedule", icon: Calendar },
  { name: "Notifications", href: "/dashboard/ngo/notifications", icon: Bell },
  { name: "Profile", href: "/dashboard/ngo/profile", icon: User },
];

export default function OrgSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  const handleLogout = async () => {
    await logout();
    setIsMobileOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard/ngo" && pathname === "/dashboard/ngo") return true;
    if (href !== "/dashboard/ngo" && (pathname === href || pathname.startsWith(href + "/"))) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#B9C0D4] shadow-md border border-[#CACDD3]"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 bg-[#B9C0D4] border-r border-[#CACDD3] transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* TOP LOGO + TOGGLE */}
        <div className="flex items-center justify-between h-16 border-b border-[#CACDD3] px-2">
          <div className="flex items-center justify-center flex-1">
            <Link href="/">
              <Image
                src="/logo3.png"
                alt="Org Logo"
                width={90}
                height={50}
                style={{ width: isCollapsed ? '32px' : '90px', height: 'auto' }}
                className="rounded-lg transition-all duration-300 cursor-pointer"
                priority
              />
            </Link>
          </div>

          {/* TOGGLE BUTTON (desktop only) */}
          <button
            className="hidden lg:block p-1 rounded hover:bg-gray-200 transition"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* MENU */}
        <div className="flex-1 mt-4 px-1 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-2 py-3 rounded-xl text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-[#9FA8DA] text-[#4F46C8]"
                      : "text-[#6B7280] hover:bg-[#AAB2C8] hover:text-[#111827]"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* BOTTOM LOGOUT */}
        <div className="p-2 border-t border-[#CACDD3]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm text-[#6B7280] hover:text-red-600 w-full px-2 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
