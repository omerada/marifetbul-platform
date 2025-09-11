'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNavigation } from './MobileNavigation';
import { useResponsive } from '@/hooks';

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showMobileNav?: boolean;
  className?: string;
}

export function MainLayout({
  children,
  showHeader = true,
  showFooter = true,
  showMobileNav = true,
  className = '',
}: MainLayoutProps) {
  const { isMobile } = useResponsive();

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {showHeader && <Header />}

      {/* Main Content */}
      <main
        className={`flex-1 ${showHeader ? 'pt-16' : ''} ${showMobileNav && isMobile ? 'pb-16' : ''}`}
      >
        {children}
      </main>

      {/* Footer */}
      {showFooter && !isMobile && <Footer />}

      {/* Mobile Navigation */}
      {showMobileNav && isMobile && <MobileNavigation />}
    </div>
  );
}
