"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { useSidebar } from "@/app/providers/SidebarContext";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  CheckSquare,
  User,
  LogOut,
  Users,
  Star,
  Award,
  Settings,
  Upload,
  ShieldCheck,
  TrendingUp,
  Calendar,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard/volunteer", icon: LayoutDashboard },
  { name: "Tasks", href: "/dashboard/volunteer/tasks", icon: Briefcase },
  { name: "My Applications", href: "/dashboard/volunteer/applications", icon: FileText },
  { name: "My Skills", href: "/dashboard/volunteer/skills", icon: CheckSquare },
  { name: "Profile", href: "/dashboard/volunteer/profile", icon: User },
  { name: "Trust Score", href: "/dashboard/volunteer/trust-history", icon: TrendingUp },
  { name: "My Schedule", href: "/dashboard/volunteer/schedule", icon: Calendar },
  { name: "Documents", href: "/dashboard/volunteer/documents", icon: Upload },
  { name: "Identity Verification", href: "/dashboard/volunteer/verify", icon: ShieldCheck },
  { name: "Participations", href: "/dashboard/volunteer/participations", icon: Users },
  { name: "Ratings", href: "/dashboard/volunteer/ratings", icon: Star },
  { name: "Certificates", href: "/dashboard/volunteer/certificates", icon: Award },
  { name: "Settings", href: "/dashboard/volunteer/settings", icon: Settings },
];

export default function VolunteerSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  const handleLogout = async () => {
    await logout();
    setIsMobileOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard/volunteer" && pathname === "/dashboard/volunteer") return true;
    if (href !== "/dashboard/volunteer" && (pathname === href || pathname.startsWith(href + "/"))) return true;
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
            <Image
              src="/logo3.png"
              alt="Volunteer Logo"
              width={90}
              height={50}
              style={{ width: isCollapsed ? '32px' : '90px', height: 'auto' }}
              className="rounded-lg transition-all duration-300"
              priority
            />
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
