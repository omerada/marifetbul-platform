'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileLayout } from '../features/MobileLayout';

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
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Render desktop layout during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex-1">{children}</main>
        {showFooter && <Footer />}
      </div>
    );
  }

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
