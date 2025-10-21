'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function DashboardHeader() {
  const pathname = usePathname();

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

        {/* Breadcrumb hint */}
        <div className="text-sm text-gray-500">
          <span className="hidden sm:inline">
            Sidebar&apos;dan tüm özelliklere erişebilirsiniz
          </span>
        </div>
      </div>
    </header>
  );
}
