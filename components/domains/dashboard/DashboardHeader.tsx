'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMessagingStore } from '@/lib/core/store/messaging';
import { MessageSquare, Bell } from 'lucide-react';

export function DashboardHeader() {
  const pathname = usePathname();
  const { conversations } = useMessagingStore();

  // Calculate unread messages
  const unreadCount =
    conversations?.filter((c) => c.unreadCount > 0).length || 0;

  // Determine page title based on route
  const getPageTitle = () => {
    if (pathname?.includes('/freelancer/packages')) return 'Paketlerim';
    if (pathname?.includes('/freelancer/orders')) return 'Siparişlerim';
    if (pathname?.includes('/freelancer/proposals')) return 'Tekliflerim';
    if (pathname?.includes('/freelancer/reviews')) return 'Değerlendirmeler';
    if (pathname?.includes('/freelancer/analytics')) return 'İstatistikler';
    if (pathname?.includes('/freelancer')) return 'Freelancer Dashboard';

    if (pathname?.includes('/employer/jobs')) return 'İş İlanlarım';
    if (pathname?.includes('/employer/orders')) return 'Siparişlerim';
    if (pathname?.includes('/employer/proposals')) return 'Alınan Teklifler';
    if (pathname?.includes('/employer/freelancers')) return "Freelancer'lar";
    if (pathname?.includes('/employer')) return 'İşveren Dashboard';

    if (pathname?.includes('/settings')) return 'Ayarlar';
    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Page Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section: Messages & Notifications */}
        <div className="flex items-center space-x-2">
          {/* Messages */}
          <Link
            href="/messages"
            className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
            title="Mesajlar"
          >
            <MessageSquare className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
            title="Bildirimler"
          >
            <Bell className="h-6 w-6" />
            {/* Notification indicator - can be connected to real API later */}
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
          </Link>
        </div>
      </div>
    </header>
  );
}
