'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileLayout } from '../features/MobileLayout';
import { useResponsive } from '@/hooks/useResponsive';

interface AppLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  user?: {
    id: string;
    userType: 'freelancer' | 'employer';
    name: string;
  } | null;
  isAuthenticated?: boolean;
}

export function AppLayout({
  children,
  showFooter = true,
  user,
  isAuthenticated = false,
}: AppLayoutProps) {
  const { isMobile } = useResponsive();

  // Mobile Layout
  if (isMobile) {
    return (
      <MobileLayout user={user} isAuthenticated={isAuthenticated}>
        {children}
      </MobileLayout>
    );
  }

  // Desktop Layout
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
