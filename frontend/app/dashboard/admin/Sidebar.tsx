"use client";

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/app/lib/utils';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/app/providers/AuthProvider';
import { useSidebar } from '@/app/providers/SidebarContext';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Building2,
  CheckCircle,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href: string;
}

const navGroups: { label: string; items: MenuItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/admin' },
    ],
  },
  {
    label: 'User Management',
    items: [
      { id: 'volunteers', label: 'Volunteers', icon: Users, href: '/dashboard/admin/volunteers' },
    ],
  },
  {
    label: 'Verification',
    items: [
      { id: 'ngo-verification', label: 'NGO Verification', icon: Building2, href: '/dashboard/admin/ngo-verification' },
      { id: 'volunteer-verification', label: 'Volunteer Verification', icon: ShieldCheck, href: '/dashboard/admin/volunteer-verification' },
    ],
  },
  {
    label: 'Task Management',
    items: [
      { id: 'task-moderation', label: 'Task Moderation', icon: CheckCircle, href: '/dashboard/admin/task-moderation' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'settings', label: 'General Settings', icon: Settings, href: '/dashboard/admin/settings' },
    ],
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  const handleLogout = async () => {
    await logout();
    setIsMobileOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/dashboard/admin' && pathname === '/dashboard/admin') return true;
    if (href !== '/dashboard/admin' && pathname.startsWith(href)) return true;
    return false;
  };

  const Item = ({ item, active }: { item: MenuItem; active: boolean }) => {
    const Icon = item.icon;
    return (
      <button
        onClick={() => {
          router.push(item.href);
          setIsMobileOpen(false);
        }}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
          active
            ? 'bg-[#9FA8DA] text-[#4F46C8]'
            : 'text-[#6B7280] hover:bg-[#AAB2C8] hover:text-[#111827]'
        )}
      >
        <Icon
          className={cn(
            'w-5 h-5 shrink-0 transition-transform duration-200',
            active ? 'text-[#4F46C8]' : 'text-[#6B7280] group-hover:text-[#111827]',
            'group-hover:scale-110'
          )}
        />
        {!isCollapsed && (
          <span className="truncate whitespace-nowrap flex-1 text-left">{item.label}</span>
        )}

        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sahayogi-blue rounded-r-full" />
        )}
      </button>
    );
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
        className={cn(
          'fixed left-0 top-0 h-screen z-40 bg-[#B9C0D4] border-r border-[#CACDD3] transition-all duration-200 ease-in-out flex flex-col',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="h-16 shrink-0 flex items-center px-4 border-b border-[#CACDD3]">
          <div className="flex items-center gap-2">
            <Image
              src="/logo1.png"
              alt="Sahayogi Logo"
              width={50}
              height={50}
              className="rounded-lg shrink-0"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-semibold text-[#111827] whitespace-nowrap">Sahayogi</h1>
                <p className="text-xs text-[#6B7280] whitespace-nowrap">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!isCollapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Item key={item.id} item={item} active={isActive(item.href)} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="shrink-0 bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          {/* Collapse Toggle - Desktop Only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {!isCollapsed && <span>Collapse</span>}
          </button>

          {/* Logout */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}