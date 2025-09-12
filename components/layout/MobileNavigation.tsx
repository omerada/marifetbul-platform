'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Package, MessageCircle, User, Plus } from 'lucide-react';

import { useAuth } from '@/hooks';

export function MobileNavigation() {
  const pathname = usePathname();
  const { isAuthenticated, isEmployer, isFreelancer } = useAuth();

  // Get navigation items based on authentication and user role
  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return [
        { href: '/', label: 'Ana Sayfa', icon: Home },
        { href: '/search', label: 'Ara', icon: Search },
        { href: '/marketplace', label: 'İş & Hizmet', icon: Package },
        { href: '/login', label: 'Giriş', icon: User },
      ];
    }

    const baseItems = [
      { href: '/dashboard', label: 'Panel', icon: Home },
      { href: '/search', label: 'Ara', icon: Search },
      { href: '/marketplace', label: 'İş & Hizmet', icon: Package },
    ];

    if (isEmployer) {
      return [
        ...baseItems,
        { href: '/marketplace/jobs/create', label: 'İş Oluştur', icon: Plus },
        { href: '/messages', label: 'Mesajlar', icon: MessageCircle },
        { href: '/profile', label: 'Profil', icon: User },
      ];
    }

    if (isFreelancer) {
      return [
        ...baseItems,
        {
          href: '/marketplace/packages/create',
          label: 'Paket Oluştur',
          icon: Plus,
        },
        { href: '/messages', label: 'Mesajlar', icon: MessageCircle },
        { href: '/profile', label: 'Profil', icon: User },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div className="grid h-16 grid-cols-5">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`}
              />
              <span
                className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
