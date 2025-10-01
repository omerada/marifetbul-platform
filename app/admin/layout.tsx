'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { Card, CardContent } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Loader2,
  BarChart3,
  Users,
  Shield,
  Settings,
  Home,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('🏗️ Admin Layout: Auth state changed:', {
      isAuthenticated,
      isLoading,
      userRole: user?.role,
    });

    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('❌ Admin Layout: Not authenticated, redirecting to login');
        router.push('/admin/login');
        return;
      }

      if (user?.role !== 'admin') {
        console.log(
          '❌ Admin Layout: User is not admin, redirecting to dashboard'
        );
        console.log('👤 Admin Layout: Current user:', user);
        router.push('/dashboard');
        return;
      }

      console.log('✅ Admin Layout: Admin access granted');
    }
  }, [isAuthenticated, isLoading, user, router]);

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
      name: 'Ana Sayfa',
      href: '/admin',
      icon: Home,
      current: pathname === '/admin',
    },
    {
      name: 'Kullanıcılar',
      href: '/admin/users',
      icon: Users,
      current: pathname === '/admin/users',
    },
    {
      name: 'Analitik',
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname === '/admin/analytics',
    },
    {
      name: 'İçerik Denetimi',
      href: '/admin/moderation',
      icon: Shield,
      current: pathname === '/admin/moderation',
    },
    {
      name: 'Ayarlar',
      href: '/admin/settings',
      icon: Settings,
      current: pathname === '/admin/settings',
    },
  ];

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Yetki kontrol ediliyor...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading if not authenticated or not admin (will redirect)
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Yönlendiriliyor...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Admin Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex w-64 flex-col">
            <div className="flex h-0 flex-1 flex-col border-r border-gray-200 bg-white">
              <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center px-4">
                  <h1 className="text-xl font-bold text-gray-900">
                    Admin Panel
                  </h1>
                </div>

                {/* User info */}
                <div className="mx-2 mt-4 rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                {/* Navigation */}
                <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                          item.current
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon
                          className={`mr-3 h-5 w-5 ${
                            item.current
                              ? 'text-gray-500'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                {/* Logout button */}
                <div className="px-2 pb-4">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="flex w-full items-center justify-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="relative flex-1 overflow-y-auto focus:outline-none">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
