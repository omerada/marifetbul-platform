/**
 * ================================================
 * SETTINGS NAVIGATION COMPONENT
 * ================================================
 * Navigation sidebar for settings pages
 * Role-based visibility for certain settings
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import {
  User,
  Bell,
  CreditCard,
  Shield,
  Lock,
  FileText,
  Smartphone,
} from 'lucide-react';

interface SettingsNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  /**
   * Optional: Only show for specific roles
   * If undefined, item is visible to all roles
   */
  roles?: ('freelancer' | 'employer' | 'admin' | 'moderator')[];
}

export function SettingsNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems: SettingsNavItem[] = [
    {
      label: 'Genel',
      href: '/dashboard/settings/general',
      icon: <User className="h-5 w-5" />,
      description: 'Profil bilgileri ve tercihler',
    },
    {
      label: 'Bildirimler',
      href: '/dashboard/settings/notifications',
      icon: <Bell className="h-5 w-5" />,
      description: 'Bildirim tercihleri',
    },
    {
      label: 'Cihazlar',
      href: '/dashboard/settings/devices',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Push bildirim cihazları',
    },
    {
      label: 'Ödeme',
      href: '/dashboard/settings/payment',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Ödeme yöntemleri ve fatura',
    },
    {
      label: 'Gizlilik',
      href: '/dashboard/settings/privacy',
      icon: <Shield className="h-5 w-5" />,
      description: 'Profil görünürlüğü ve gizlilik',
    },
    {
      label: 'Güvenlik',
      href: '/dashboard/settings/security',
      icon: <Lock className="h-5 w-5" />,
      description: 'Şifre ve iki faktörlü kimlik doğrulama',
    },
    {
      label: 'Mesaj Şablonları',
      href: '/dashboard/settings/templates',
      icon: <FileText className="h-5 w-5" />,
      description: 'Hızlı yanıt şablonları',
      roles: ['freelancer'], // Only for freelancers
    },
  ];

  // Filter items by role
  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    const userRole = user?.role as
      | 'freelancer'
      | 'employer'
      | 'admin'
      | 'moderator'
      | undefined;
    return userRole && item.roles.includes(userRole);
  });

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <nav className="space-y-1" aria-label="Ayarlar navigasyonu">
      {visibleItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-start space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <span
              className={`mt-0.5 flex-shrink-0 ${active ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}`}
            >
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className={active ? 'text-blue-700' : 'text-gray-900'}>
                {item.label}
              </div>
              <p
                className={`mt-0.5 text-xs ${active ? 'text-blue-600' : 'text-gray-500'}`}
              >
                {item.description}
              </p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Mobile Settings Navigation
 * Dropdown/tabs style for mobile view
 */
export function MobileSettingsNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems: SettingsNavItem[] = [
    {
      label: 'Genel',
      href: '/dashboard/settings/general',
      icon: <User className="h-4 w-4" />,
      description: 'Profil bilgileri',
    },
    {
      label: 'Bildirimler',
      href: '/dashboard/settings/notifications',
      icon: <Bell className="h-4 w-4" />,
      description: 'Bildirimler',
    },
    {
      label: 'Cihazlar',
      href: '/dashboard/settings/devices',
      icon: <Smartphone className="h-4 w-4" />,
      description: 'Cihazlar',
    },
    {
      label: 'Ödeme',
      href: '/dashboard/settings/payment',
      icon: <CreditCard className="h-4 w-4" />,
      description: 'Ödeme',
    },
    {
      label: 'Gizlilik',
      href: '/dashboard/settings/privacy',
      icon: <Shield className="h-4 w-4" />,
      description: 'Gizlilik',
    },
    {
      label: 'Güvenlik',
      href: '/dashboard/settings/security',
      icon: <Lock className="h-4 w-4" />,
      description: 'Güvenlik',
    },
    {
      label: 'Şablonlar',
      href: '/dashboard/settings/templates',
      icon: <FileText className="h-4 w-4" />,
      description: 'Şablonlar',
      roles: ['freelancer'],
    },
  ];

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    const userRole = user?.role as
      | 'freelancer'
      | 'employer'
      | 'admin'
      | 'moderator'
      | undefined;
    return userRole && item.roles.includes(userRole);
  });

  return (
    <div className="overflow-x-auto border-b border-gray-200 bg-white">
      <nav
        className="-mb-px flex space-x-4 px-4"
        aria-label="Ayarlar navigasyonu"
      >
        {visibleItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
