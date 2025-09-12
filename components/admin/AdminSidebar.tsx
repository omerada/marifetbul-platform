'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
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
  LogOut,
  X,
  CreditCard,
  MessageCircle,
  Database,
  Lock,
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

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    current: false,
    badge: null,
  },
  {
    name: 'Kullanıcılar',
    href: '/admin/users',
    icon: Users,
    current: false,
    badge: 'new',
  },
  {
    name: 'Moderasyon',
    href: '/admin/moderation',
    icon: Shield,
    current: false,
    badge: '12',
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    current: false,
    badge: null,
  },
  {
    name: 'Raporlar',
    href: '/admin/reports',
    icon: FileText,
    current: false,
    badge: null,
  },
  {
    name: 'Finans',
    href: '/admin/finance',
    icon: CreditCard,
    current: false,
    badge: null,
  },
  {
    name: 'Destek',
    href: '/admin/support',
    icon: MessageCircle,
    current: false,
    badge: '8',
  },
  {
    name: 'Sistem Logları',
    href: '/admin/logs',
    icon: Database,
    current: false,
    badge: null,
  },
  {
    name: 'Güvenlik',
    href: '/admin/security',
    icon: Lock,
    current: false,
    badge: null,
  },
  {
    name: 'Ayarlar',
    href: '/admin/settings',
    icon: Settings,
    current: false,
    badge: null,
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

  // Update navigation with current state
  const updatedNavigation = navigationItems.map((item) => ({
    ...item,
    current: pathname === item.href,
  }));

  const filteredNavigation = updatedNavigation.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col',
          'ease-out-quart transition-all duration-300',
          isCollapsed ? 'lg:w-16' : 'lg:w-64'
        )}
      >
        <div className="shadow-soft flex flex-col border-r border-gray-200 bg-white">
          {/* Logo & Toggle */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            {!isCollapsed && (
              <Link href="/admin" className="flex items-center space-x-2">
                <Image
                  src="/logo.png"
                  alt="Marifeto"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="text-lg font-semibold text-gray-900">
                  Admin
                </span>
              </Link>
            )}

            {isCollapsed && (
              <Link
                href="/admin"
                className="flex w-full items-center justify-center"
              >
                <Image
                  src="/logo.png"
                  alt="Marifeto"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </Link>
            )}

            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search */}
          {!isCollapsed && (
            <div className="border-b border-gray-100 p-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Menüde ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-gray-200 bg-gray-50 pl-10 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-gray-50 hover:text-gray-900',
                    isCollapsed ? 'justify-center' : 'justify-start',
                    item.current
                      ? 'bg-primary-50 text-primary-700 border-primary-200 border'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      item.current
                        ? 'text-primary-600'
                        : 'text-gray-500 group-hover:text-gray-700',
                      !isCollapsed && 'mr-3'
                    )}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <Badge
                          variant={
                            item.badge === 'new' ? 'default' : 'secondary'
                          }
                          className="ml-auto"
                        >
                          {item.badge === 'new' ? 'Yeni' : item.badge}
                        </Badge>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-full z-50 ml-2 rounded-lg bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {item.name}
                      {item.badge && (
                        <span className="ml-1 rounded bg-gray-700 px-1">
                          {item.badge === 'new' ? 'Yeni' : item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-gray-200 p-4">
            {/* Alerts summary */}
            {!isCollapsed && alertsSummary.unread > 0 && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-800">
                    {alertsSummary.unread} bekleyen uyarı
                  </span>
                </div>
              </div>
            )}

            {/* Collapse toggle for collapsed state */}
            {isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="w-full justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {/* Logout */}
            <Button
              variant="ghost"
              size={isCollapsed ? 'sm' : 'md'}
              className={cn(
                'w-full transition-colors',
                isCollapsed ? 'justify-center px-2' : 'justify-start'
              )}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Çıkış Yap</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          isOpen ? 'block' : 'hidden'
        )}
      >
        <div className="shadow-large fixed inset-y-0 left-0 w-64 border-r border-gray-200 bg-white">
          {/* Mobile header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <Link href="/admin" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Marifeto"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-lg font-semibold text-gray-900">
                Admin Panel
              </span>
            </Link>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile navigation */}
          <nav className="mt-4 space-y-1 px-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-gray-50 hover:text-gray-900',
                    pathname === item.href
                      ? 'bg-primary-50 text-primary-700 border-primary-200 border'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      pathname === item.href
                        ? 'text-primary-600'
                        : 'text-gray-500 group-hover:text-gray-700'
                    )}
                  />
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badge === 'new' ? 'default' : 'secondary'}
                      className="ml-auto"
                    >
                      {item.badge === 'new' ? 'Yeni' : item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile bottom section */}
          <div className="absolute right-0 bottom-0 left-0 border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              size="md"
              className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;
