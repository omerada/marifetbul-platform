'use client';

import React, { ReactNode } from 'react';
import { MobileNavigation } from './MobileNavigation';

interface MobileLayoutProps {
  children: ReactNode;
  user?: {
    id: string;
    userType: 'freelancer' | 'employer';
    name: string;
  } | null;
  isAuthenticated: boolean;
  showNavigation?: boolean;
}

export function MobileLayout({
  children,
  user,
  isAuthenticated,
  showNavigation = true,
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 lg:hidden">
      {/* Mobile Navigation */}
      {showNavigation && (
        <MobileNavigation user={user} isAuthenticated={isAuthenticated} />
      )}

      {/* Main Content */}
      <main className={`${showNavigation ? 'pt-16 pb-20' : ''}`}>
        {children}
      </main>
    </div>
  );
}
