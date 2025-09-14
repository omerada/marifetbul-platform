'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Home,
  Search,
  Briefcase,
  MessageCircle,
  User,
  Plus,
  Bell,
  Menu,
  X,
} from 'lucide-react';

interface MobileNavigationProps {
  user?: {
    id: string;
    userType: 'freelancer' | 'employer';
    name: string;
  } | null;
  isAuthenticated: boolean;
}

export function MobileNavigation({
  user,
  isAuthenticated,
}: MobileNavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const bottomNavItems = [
    {
      icon: Home,
      label: 'Ana Sayfa',
      href: '/',
      active: pathname === '/',
    },
    {
      icon: Search,
      label: 'Keşfet',
      href: '/marketplace',
      active: pathname.startsWith('/marketplace'),
    },
    {
      icon: Plus,
      label: 'Oluştur',
      href:
        user?.userType === 'freelancer' ? '/packages/create' : '/jobs/create',
      active: false,
      requiresAuth: true,
    },
    {
      icon: MessageCircle,
      label: 'Mesajlar',
      href: '/messages',
      active: pathname.startsWith('/messages'),
      requiresAuth: true,
    },
    {
      icon: User,
      label: 'Profil',
      href: isAuthenticated ? '/dashboard' : '/login',
      active:
        pathname.startsWith('/dashboard') || pathname.startsWith('/profile'),
    },
  ];

  const mobileMenuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      requiresAuth: true,
    },
    {
      label: 'İş İlanları',
      href: '/marketplace?mode=jobs',
      icon: Briefcase,
    },
    {
      label: 'Hizmetler',
      href: '/marketplace?mode=services',
      icon: Search,
    },
    {
      label: 'Mesajlar',
      href: '/messages',
      icon: MessageCircle,
      requiresAuth: true,
    },
    {
      label: 'Bildirimler',
      href: '/notifications',
      icon: Bell,
      requiresAuth: true,
    },
    {
      label: 'Profilim',
      href: user ? `/profile/${user.id}` : '/login',
      icon: User,
    },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 right-0 left-0 z-40 border-b border-gray-200 bg-white lg:hidden">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Marifeto
          </Link>

          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full right-0 left-0 border-b border-gray-200 bg-white shadow-lg">
            <div className="space-y-1 py-4">
              {mobileMenuItems.map((item) => {
                if (item.requiresAuth && !isAuthenticated) return null;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <item.icon className="mr-3 h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {!isAuthenticated && (
                <div className="space-y-2 border-t border-gray-200 px-4 pt-4">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button size="sm" className="w-full">
                      Üye Ol
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Bottom Navigation */}
      <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 bg-white lg:hidden">
        <div className="grid grid-cols-5 py-2">
          {bottomNavItems.map((item) => {
            if (
              item.requiresAuth &&
              !isAuthenticated &&
              item.label !== 'Profil'
            ) {
              return (
                <div
                  key={item.label}
                  className="flex flex-col items-center py-2 opacity-50"
                >
                  <item.icon className="h-5 w-5 text-gray-400" />
                  <span className="mt-1 text-xs text-gray-400">
                    {item.label}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 transition-colors ${
                  item.active
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${
                    item.active ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`mt-1 text-xs ${
                    item.active ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="bg-opacity-25 fixed inset-0 z-30 bg-black lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      {/* Spacer for fixed navigation */}
      <div className="h-16 lg:hidden"></div> {/* Top spacer */}
      <div className="h-16 lg:hidden"></div> {/* Bottom spacer */}
    </>
  );
}
