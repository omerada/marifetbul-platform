'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  FileText,
  Settings,
  Briefcase,
  Star,
  TrendingUp,
  Users,
  Menu,
  X,
  ChevronLeft,
  Home,
  LogOut,
  User,
  RefreshCcw,
} from 'lucide-react';
import Image from 'next/image';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  matchPaths?: string[];
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isFreelancer = user?.role === 'FREELANCER';

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const freelancerNav: NavItem[] = [
    {
      label: 'Genel Bakış',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/dashboard/freelancer',
      matchPaths: ['/dashboard', '/dashboard/freelancer'],
    },
    {
      label: 'Paketlerim',
      icon: <Package className="h-5 w-5" />,
      href: '/dashboard/freelancer/packages',
      matchPaths: ['/dashboard/freelancer/packages'],
    },
    {
      label: 'Siparişler',
      icon: <Briefcase className="h-5 w-5" />,
      href: '/dashboard/freelancer/orders',
      matchPaths: ['/dashboard/freelancer/orders'],
    },
    {
      label: 'İade Taleplerim',
      icon: <RefreshCcw className="h-5 w-5" />,
      href: '/dashboard/refunds',
      matchPaths: ['/dashboard/refunds'],
    },
    {
      label: 'Teklifler',
      icon: <FileText className="h-5 w-5" />,
      href: '/dashboard/freelancer/proposals',
      matchPaths: ['/dashboard/freelancer/proposals'],
    },
    {
      label: 'Mesajlar',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/messages',
      matchPaths: ['/messages'],
    },
    {
      label: 'Değerlendirmeler',
      icon: <Star className="h-5 w-5" />,
      href: '/dashboard/freelancer/reviews',
      matchPaths: ['/dashboard/freelancer/reviews'],
    },
    {
      label: 'İstatistikler',
      icon: <TrendingUp className="h-5 w-5" />,
      href: '/dashboard/freelancer/analytics',
      matchPaths: ['/dashboard/freelancer/analytics'],
    },
  ];

  const employerNav: NavItem[] = [
    {
      label: 'Genel Bakış',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/dashboard',
      matchPaths: ['/dashboard', '/dashboard/employer'],
    },
    {
      label: 'İş İlanları',
      icon: <Briefcase className="h-5 w-5" />,
      href: '/dashboard/my-jobs',
      matchPaths: ['/dashboard/my-jobs', '/dashboard/employer/jobs'],
    },
    {
      label: 'Siparişler',
      icon: <Package className="h-5 w-5" />,
      href: '/dashboard/orders',
      matchPaths: ['/dashboard/orders', '/dashboard/employer/orders'],
    },
    {
      label: 'İade Taleplerim',
      icon: <RefreshCcw className="h-5 w-5" />,
      href: '/dashboard/refunds',
      matchPaths: ['/dashboard/refunds'],
    },
    {
      label: 'Teklifler',
      icon: <FileText className="h-5 w-5" />,
      href: '/dashboard/my-proposals',
      matchPaths: ['/dashboard/my-proposals', '/dashboard/employer/proposals'],
    },
    {
      label: 'Mesajlar',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/messages',
      matchPaths: ['/messages'],
    },
    {
      label: "Freelancer'lar",
      icon: <Users className="h-5 w-5" />,
      href: '/search?type=freelancers',
      matchPaths: ['/search', '/dashboard/employer/freelancers'],
    },
  ];

  const navItems = isFreelancer ? freelancerNav : employerNav;

  const isActiveRoute = (item: NavItem) => {
    return item.matchPaths?.some(
      (path) => pathname === path || pathname?.startsWith(path + '/')
    );
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const SidebarContent = () => (
    <>
      {/* Logo & Brand */}
      <div
        className={`flex items-center justify-between border-b border-gray-200 px-4 py-4 ${isCollapsed ? 'px-2' : ''}`}
      >
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/icons/icon-48x48.png"
            alt="MarifetBul"
            width={32}
            height={32}
            className="rounded-lg"
          />
          {!isCollapsed && (
            <span className="text-lg font-bold text-gray-900">MarifetBul</span>
          )}
        </Link>
        {!isMobileOpen && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:block"
            title={isCollapsed ? 'Genişlet' : 'Daralt'}
          >
            <ChevronLeft
              className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* User Profile */}
      <div className="border-b border-gray-200 p-4">
        <Link
          href={`/profile/${user?.id}`}
          className="flex items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-gray-100"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <p className="truncate font-medium text-gray-900">
                {user?.name || 'Kullanıcı'}
              </p>
              <p className="truncate text-xs text-gray-500">
                {isFreelancer ? 'Freelancer' : 'İşveren'}
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = isActiveRoute(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={isActive ? 'text-blue-700' : 'text-gray-500'}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-1 border-t border-gray-200 p-4">
        <Link
          href="/"
          className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
          title={isCollapsed ? 'Ana Sayfa' : undefined}
        >
          <Home className="h-5 w-5 text-gray-500" />
          {!isCollapsed && <span>Ana Sayfa</span>}
        </Link>

        <Link
          href="/profile/edit"
          className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
          title={isCollapsed ? 'Profil Ayarları' : undefined}
        >
          <User className="h-5 w-5 text-gray-500" />
          {!isCollapsed && <span>Profil Ayarları</span>}
        </Link>

        <Link
          href="/dashboard/settings"
          className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
          title={isCollapsed ? 'Ayarlar' : undefined}
        >
          <Settings className="h-5 w-5 text-gray-500" />
          {!isCollapsed && <span>Ayarlar</span>}
        </Link>

        <button
          onClick={handleLogout}
          className={`group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
          title={isCollapsed ? 'Çıkış Yap' : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-lg lg:hidden"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="bg-opacity-50 fixed inset-0 z-40 bg-gray-900 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow-xl lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden border-r border-gray-200 bg-white transition-all duration-300 lg:flex lg:flex-col ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
