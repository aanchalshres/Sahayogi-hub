"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/app/lib/utils';
import { Button } from '@/app/components/ui/button';
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  pendingCount?: number;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { id: 'ngo-verification', label: 'NGO Verification', icon: Users, badge: true, href: '/admin/ngo-verification' },
  { id: 'task-moderation', label: 'Task Moderation', icon: CheckCircle, href: '/admin/task-moderation' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export function Sidebar({ pendingCount = 0 }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logout clicked');
  };

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') return true;
    if (href !== '/admin' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200"
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
          'fixed left-0 top-0 h-full z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-out',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Image
              src="/logo3.png"
              alt="Sahayogi Logo"
              width={36}
              height={36}
              className="rounded-lg shrink-0"
              priority
            />
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-semibold text-gray-900 whitespace-nowrap">Sahayogi</h1>
                <p className="text-xs text-gray-500 whitespace-nowrap">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const badgeCount = item.badge ? pendingCount : 0;

            return (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.href);
                  setIsMobileOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                  active
                    ? 'bg-sahayogi-blue-light text-sahayogi-blue'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-transform duration-200',
                    active ? 'text-sahayogi-blue' : 'text-gray-400 group-hover:text-gray-600',
                    'group-hover:scale-110'
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate whitespace-nowrap flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && badgeCount > 0 && (
                  <span className="ml-auto bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse">
                    {badgeCount}
                  </span>
                )}
                {isCollapsed && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center rounded-full animate-pulse">
                    {badgeCount}
                  </span>
                )}

                {/* Active Indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sahayogi-blue rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
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
