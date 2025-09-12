'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  FileText,
  BarChart3,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAdminDashboard } from '@/hooks';

interface AdminSidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    current: true,
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    current: false,
    badge: 'new',
  },
  {
    name: 'Content Moderation',
    href: '/admin/moderation',
    icon: Shield,
    current: false,
    badge: '12',
  },
  {
    name: 'Platform Settings',
    href: '/admin/settings',
    icon: Settings,
    current: false,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    current: false,
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    current: false,
  },
  {
    name: 'System Health',
    href: '/admin/health',
    icon: AlertTriangle,
    current: false,
  },
];

export function AdminSidebar({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const { alertsSummary } = useAdminDashboard();

  const filteredNavigation = navigation.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800',
          isOpen ? (isCollapsed ? 'w-16' : 'w-64') : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-4 dark:border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600">
                <span className="text-sm font-semibold text-white">M</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                Admin Panel
              </span>
            </div>
          )}

          {/* Collapse toggle - Desktop */}
          <div className="ml-auto hidden lg:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Close button - Mobile */}
          <div className="ml-auto lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {filteredNavigation.map((item) => {
            const isCurrent = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  isCurrent
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isCurrent
                      ? 'text-indigo-500 dark:text-indigo-200'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 truncate">{item.name}</span>
                    {item.badge && (
                      <Badge
                        variant={item.badge === 'new' ? 'default' : 'secondary'}
                        className="ml-auto"
                      >
                        {item.badge === 'new' ? 'New' : item.badge}
                      </Badge>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <div className="absolute top-1 left-8 h-2 w-2 rounded-full bg-red-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          {!isCollapsed && (
            <div className="space-y-2">
              {/* System status */}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <div className="mr-2 h-2 w-2 rounded-full bg-green-400" />
                System Healthy
              </div>

              {/* Alerts summary */}
              {alertsSummary.unread > 0 && (
                <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                  <Bell className="mr-2 h-4 w-4" />
                  {alertsSummary.unread} unread alerts
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            size={isCollapsed ? 'sm' : 'md'}
            className={cn('mt-2 w-full justify-start', isCollapsed && 'px-2')}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;
