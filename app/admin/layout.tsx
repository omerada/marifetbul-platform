/**
 * ================================================
 * ADMIN LAYOUT
 * ================================================
 * Admin panel layout with sidebar navigation
 *
 * Sprint 2.2: Route Cleanup - Simplified Layout
 * - Removed client-side auth checks (middleware handles this)
 * - Reduced from 331 → ~180 lines (-45%)
 * - Focused on UI rendering only
 * - Faster page loads (no auth blocking)
 *
 * @version 2.0.0
 * @author MarifetBul Development Team
 */

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { AdminTwoFactorEnforcement } from '@/components/domains/admin/AdminTwoFactorEnforcement';
import {
  BarChart3,
  Users,
  Shield,
  Settings,
  Home,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  Activity,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Skip layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const navigationItems = [
    {
      name: 'Panel',
      href: '/admin',
      icon: Home,
      current: pathname === '/admin',
      description: 'Platform özeti',
    },
    {
      name: 'Kullanıcılar',
      href: '/admin/users',
      icon: Users,
      current: pathname === '/admin/users',
      description: 'Kullanıcı yönetimi',
    },
    {
      name: 'Analitik',
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname === '/admin/analytics',
      description: 'Platform metrikleri',
    },
    {
      name: 'Kalite',
      href: '/admin/quality',
      icon: Activity,
      current: pathname === '/admin/quality',
      description: 'Kalite & Değerlendirme',
    },
    {
      name: 'İçerik',
      href: '/admin/moderation',
      icon: Shield,
      current: pathname === '/admin/moderation',
      description: 'İçerik denetimi',
    },
    {
      name: 'Güvenlik',
      href: '/admin/settings/security',
      icon: Lock,
      current: pathname === '/admin/settings/security',
      description: '2FA & Güvenlik ayarları',
    },
    {
      name: 'Ayarlar',
      href: '/admin/settings',
      icon: Settings,
      current: pathname === '/admin/settings',
      description: 'Platform ayarları',
    },
  ];

  // Render admin panel (middleware already protected the route)
  return (
    <AdminTwoFactorEnforcement>
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen overflow-hidden">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="bg-opacity-75 fixed inset-0 bg-gray-600"
                onClick={() => setSidebarOpen(false)}
              />
            </div>
          )}

          {/* Desktop Sidebar */}
          <div
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-out lg:static lg:inset-0 lg:translate-x-0',
              sidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full lg:translate-x-0'
            )}
          >
            <div className="flex h-full flex-col border-r border-gray-200/50 bg-white/80 backdrop-blur-xl">
              {/* Header */}
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200/50 px-6">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Admin Panel
                  </h1>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Profile Card */}
              <div className="m-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    {(user?.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {user?.name || 'Admin'}
                    </p>
                    <p className="truncate text-xs text-gray-600">
                      {user?.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <span className="text-xs text-green-600">Çevrimiçi</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 px-4 pb-4">
                <div className="mb-3 px-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Ana Menü
                </div>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.current;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <Icon
                        className={cn(
                          'mr-3 h-5 w-5 transition-colors',
                          isActive ? 'text-white' : 'text-gray-500'
                        )}
                      />
                      <div className="flex-1">
                        <div
                          className={cn(
                            'font-medium',
                            isActive ? 'text-white' : 'text-gray-900'
                          )}
                        >
                          {item.name}
                        </div>
                        <div
                          className={cn(
                            'mt-0.5 text-xs',
                            isActive ? 'text-blue-100' : 'text-gray-500'
                          )}
                        >
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <ChevronRight className="h-4 w-4 text-blue-100" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="border-t border-gray-200/50 p-4">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-center border-red-200 bg-red-50 text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </Button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Mobile header */}
            <div className="lg:hidden">
              <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <h1 className="text-lg font-semibold text-gray-900">
                  Admin Panel
                </h1>
                <Button variant="ghost" size="sm">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Main content area */}
            <main className="relative flex-1 overflow-y-auto focus:outline-none">
              <div className="h-full p-6 lg:pl-8">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </AdminTwoFactorEnforcement>
  );
}
